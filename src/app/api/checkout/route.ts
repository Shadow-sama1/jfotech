import { randomUUID } from "node:crypto";
import { AddressLabel, DeliveryMethod } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { consumeRateLimit } from "@/lib/auth-rate-limit";
import { addressSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { initializePayment } from "@/lib/paystack";
import { isValidNigerianLocation } from "@/lib/nigeria";

const checkoutSchema = z.object({
  deliveryMethod: z.enum(["DOOR", "PICKUP"]),
  deliveryState: z.string().trim().min(2).max(60),
  addressId: z.string().min(1).optional(),
  newAddress: addressSchema.optional(),
  pickupLocation: z.enum(["LAGOS_IKEJA"]).optional(),
  installProductIds: z.array(z.string().min(1)).max(100).default([]),
  preferredInstallAt: z.string().datetime().optional(),
  couponCode: z.string().trim().max(40).optional(),
  customerNote: z.string().trim().max(1000).optional(),
}).superRefine((data, context) => {
  if (data.deliveryMethod === "DOOR" && !data.addressId && !data.newAddress) context.addIssue({ code: "custom", path: ["addressId"], message: "Choose or add a delivery address." });
  if (data.deliveryMethod === "DOOR" && data.addressId && data.newAddress) context.addIssue({ code: "custom", path: ["newAddress"], message: "Choose one address." });
  if (data.deliveryMethod === "PICKUP" && !data.pickupLocation) context.addIssue({ code: "custom", path: ["pickupLocation"], message: "Select a pickup point." });
});

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) return Response.json({ error: "Checkout requires a configured database." }, { status: 503 });
  if (!process.env.PAYSTACK_SECRET_KEY) return Response.json({ error: "Online payment is not configured yet." }, { status: 503 });

  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in before checkout." }, { status: 401 });
  if (!(await consumeRateLimit(`checkout:${session.user.id}`, 5, 10 * 60_000))) return Response.json({ error: "Too many checkout attempts. Wait a few minutes and try again." }, { status: 429 });

  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Check the delivery and service options.", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
  const input = parsed.data;

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: { include: { product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } } } } },
    });
    if (!cart?.items.length) return Response.json({ error: "Your saved cart is empty. Add products before checkout." }, { status: 400 });

    const invalidStock = cart.items.find(({ product, quantity }) => !product.isPublished || product.stock < quantity);
    if (invalidStock) return Response.json({ error: `${invalidStock.product.name} is no longer available in the requested quantity. Update your cart and try again.` }, { status: 409 });

    const selectedIds = new Set(input.installProductIds);
    const unavailableInstall = cart.items.find(({ product }) => selectedIds.has(product.id) && !product.installationEligible);
    if (unavailableInstall) return Response.json({ error: `Professional installation is not available for ${unavailableInstall.product.name}.` }, { status: 400 });
    const unknownInstallId = [...selectedIds].some((id) => !cart.items.some((item) => item.productId === id));
    if (unknownInstallId) return Response.json({ error: "Your installation options changed. Refresh checkout and try again." }, { status: 400 });

    let savedAddressId: string | null = null;
    let deliveryFee = 0;
    let pickupLocation: string | null = null;
    if (input.deliveryMethod === DeliveryMethod.DOOR) {
      if (input.newAddress) {
        if (!isValidNigerianLocation(input.newAddress.state, input.newAddress.lga)) return Response.json({ error: "Select a valid Nigerian state and LGA." }, { status: 400 });
        if (input.newAddress.state !== input.deliveryState) return Response.json({ error: "Delivery state must match your address." }, { status: 400 });
      } else if (input.addressId) {
        const address = await prisma.address.findFirst({ where: { id: input.addressId, userId: session.user.id } });
        if (!address) return Response.json({ error: "The selected address was not found." }, { status: 400 });
        if (address.state !== input.deliveryState) return Response.json({ error: "Delivery state must match your address." }, { status: 400 });
        savedAddressId = address.id;
      }
      const zone = await prisma.deliveryZone.findFirst({ where: { state: input.deliveryState, isActive: true }, select: { fee: true } });
      if (!zone) return Response.json({ error: "Delivery is not available for the selected state yet. Choose pickup or contact our team." }, { status: 400 });
      deliveryFee = zone.fee;
    } else {
      pickupLocation = input.pickupLocation === "LAGOS_IKEJA" ? "JFO Tech Pickup Point, Ikeja, Lagos" : null;
    }

    const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const installationFee = cart.items.reduce((sum, item) => selectedIds.has(item.productId) ? sum + item.product.installationFee * item.quantity : sum, 0);
    let coupon: { id: string; discount: number; usageLimit: number | null } | null = null;
    const couponCode = input.couponCode?.trim().toUpperCase();
    if (couponCode) {
      const record = await prisma.coupon.findUnique({ where: { code: couponCode } });
      const now = new Date();
      if (!record || !record.isActive || (record.startsAt && record.startsAt > now) || (record.expiresAt && record.expiresAt < now) || (record.usageLimit !== null && record.usageCount >= record.usageLimit) || subtotal < record.minimumSubtotal) {
        return Response.json({ error: "This coupon is invalid, expired, or does not apply to this order." }, { status: 400 });
      }
      const rawDiscount = record.type === "PERCENTAGE" ? Math.floor(subtotal * record.value / 100) : record.value;
      coupon = { id: record.id, discount: Math.min(subtotal, record.maxDiscount ? Math.min(rawDiscount, record.maxDiscount) : rawDiscount), usageLimit: record.usageLimit };
    }

    const total = subtotal + deliveryFee + installationFee - (coupon?.discount ?? 0);
    if (!Number.isSafeInteger(total) || total <= 0) return Response.json({ error: "The calculated order total is invalid." }, { status: 400 });
    const reference = `JFO-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 8).toUpperCase()}`;
    const preferredInstallAt = input.preferredInstallAt ? new Date(input.preferredInstallAt) : null;
    if (preferredInstallAt && (preferredInstallAt < new Date(Date.now() + 24 * 60 * 60_000) || preferredInstallAt > new Date(Date.now() + 180 * 24 * 60 * 60_000))) {
      return Response.json({ error: "Choose an installation date between tomorrow and six months from now." }, { status: 400 });
    }

    const order = await prisma.$transaction(async (transaction) => {
      if (coupon) {
        const claimed = await transaction.coupon.updateMany({
          where: { id: coupon.id, isActive: true, ...(coupon.usageLimit !== null ? { usageCount: { lt: coupon.usageLimit } } : {}) },
          data: { usageCount: { increment: 1 } },
        });
        if (!claimed.count) throw new Error("Coupon limit reached");
      }

      if (input.newAddress && input.deliveryMethod === DeliveryMethod.DOOR) {
        const created = await transaction.address.create({ data: {
          userId: session.user.id,
          label: input.newAddress.label as AddressLabel,
          fullName: input.newAddress.fullName,
          phone: input.newAddress.phone,
          street: input.newAddress.street,
          street2: input.newAddress.street2 || null,
          city: input.newAddress.city,
          state: input.newAddress.state,
          lga: input.newAddress.lga,
          postalCode: input.newAddress.postalCode || null,
          isDefault: false,
        } });
        savedAddressId = created.id;
      }

      return transaction.order.create({
        data: {
          reference,
          userId: session.user.id,
          addressId: savedAddressId,
          couponId: coupon?.id,
          status: "PENDING",
          deliveryMethod: input.deliveryMethod,
          deliveryState: input.deliveryState,
          deliveryFee,
          installationFee,
          subtotal,
          discount: coupon?.discount ?? 0,
          total,
          preferredInstallAt,
          pickupLocation,
          customerNote: input.customerNote || null,
          items: { create: cart.items.map(({ product, quantity }) => {
            const installation = selectedIds.has(product.id);
            return {
              productId: product.id,
              name: product.name,
              sku: product.sku,
              image: product.images[0]?.url ?? null,
              unitPrice: product.price,
              quantity,
              installation,
              installationFee: installation ? product.installationFee * quantity : 0,
            };
          }) },
        },
      });
    });

    const payment = await initializePayment(order.id);
    return Response.json({ orderId: order.id, reference: order.reference, authorizationUrl: payment.authorizationUrl }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create checkout.";
    console.error("Checkout creation failed", message);
    const status = message.includes("Coupon limit") ? 409 : message.includes("Paystack") ? 502 : 500;
    return Response.json({ error: status === 500 ? "We could not start checkout. Please try again." : message }, { status });
  }
}