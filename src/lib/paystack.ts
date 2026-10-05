import { createHmac, timingSafeEqual } from "node:crypto";
import { PaymentStatus, Prisma, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendAccountEmail } from "@/lib/email";

const paystackApi = "https://api.paystack.co";

type PaystackInitializeData = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

type PaystackVerifyData = {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  channel?: string;
  gateway_response?: string;
  paid_at?: string;
};

function secretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured");
  return key;
}

export function paymentCallbackUrl() {
  const base = (process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")).replace(/\/$/, "");
  return `${base}/api/payments/callback`;
}

export function validatePaystackSignature(rawBody: string, signature: string | null) {
  if (!signature || !/^[a-f0-9]{128}$/i.test(signature)) return false;
  const expected = createHmac("sha512", secretKey()).update(rawBody).digest();
  const supplied = Buffer.from(signature, "hex");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export async function initializePayment(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { user: { select: { email: true } } } });
  if (!order || !order.user.email) throw new Error("Order or customer email was not found");
  if (order.status !== OrderStatus.PENDING) throw new Error("Only pending orders can be paid");
  if (order.total <= 0) throw new Error("Order total must be positive");

  const payment = await prisma.payment.create({ data: { orderId: order.id, reference: `${order.reference}-${Date.now().toString(36)}`, amount: order.total, status: PaymentStatus.INITIALIZED } });
  const response = await fetch(`${paystackApi}/transaction/initialize`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secretKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: order.user.email,
      amount: order.total * 100,
      currency: "NGN",
      reference: payment.reference,
      callback_url: paymentCallbackUrl(),
      metadata: { orderId: order.id, orderReference: order.reference, paymentId: payment.id },
    }),
    cache: "no-store",
  });
  const result = await response.json().catch(() => null) as { status?: boolean; message?: string; data?: PaystackInitializeData } | null;
  if (!response.ok || !result?.status || !result.data?.authorization_url || !result.data.access_code) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.FAILED, gatewayResponse: result?.message ?? `Paystack initialization failed (${response.status})` } });
    throw new Error(result?.message ?? "Paystack could not initialize this payment");
  }

  await prisma.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.PENDING, authorizationUrl: result.data.authorization_url, accessCode: result.data.access_code } });
  return { authorizationUrl: result.data.authorization_url, reference: payment.reference };
}

export async function verifyAndCompletePayment(reference: string, markWebhook = false) {
  const response = await fetch(`${paystackApi}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
    cache: "no-store",
  });
  const result = await response.json().catch(() => null) as { status?: boolean; message?: string; data?: PaystackVerifyData } | null;
  const verified = result?.data;
  const payment = await prisma.payment.findUnique({ where: { reference }, include: { order: { include: { items: true } } } });
  if (!payment) return { success: false as const, message: "Payment reference was not found." };
  if (payment.status === PaymentStatus.SUCCESS && payment.order.status === OrderStatus.PAID) {
    if (markWebhook && !payment.webhookProcessedAt) await prisma.payment.update({ where: { id: payment.id }, data: { webhookProcessedAt: new Date() } });
    return { success: true as const, orderId: payment.orderId, reference: payment.order.reference };
  }

  if (!response.ok || !result?.status || !verified || verified.status !== "success" || verified.reference !== payment.reference || verified.amount !== payment.amount * 100 || verified.currency !== "NGN") {
    if (verified?.status && verified.status !== "success") {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.FAILED, gatewayResponse: verified.gateway_response ?? verified.status, rawResponse: result as Prisma.InputJsonValue } });
    }
    return { success: false as const, message: result?.message ?? "Payment could not be verified." };
  }

  try {
    const newlyPaid = await prisma.$transaction(async (transaction) => {
      const orderUpdate = await transaction.order.updateMany({ where: { id: payment.orderId, status: OrderStatus.PENDING }, data: { status: OrderStatus.PAID, paidAt: verified.paid_at ? new Date(verified.paid_at) : new Date() } });
      if (orderUpdate.count === 0) {
        const current = await transaction.order.findUnique({ where: { id: payment.orderId }, select: { status: true } });
        if (current?.status === OrderStatus.PAID) return;
        throw new Error("Order is no longer payable");
      }

      for (const item of payment.order.items) {
        if (!item.productId) continue;
        const stockUpdate = await transaction.product.updateMany({ where: { id: item.productId, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
        if (stockUpdate.count !== 1) throw new Error(`Insufficient stock for ${item.sku}`);
      }

      await transaction.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.SUCCESS, channel: verified.channel, gatewayResponse: verified.gateway_response, paidAt: verified.paid_at ? new Date(verified.paid_at) : new Date(), rawResponse: result as Prisma.InputJsonValue, ...(markWebhook ? { webhookProcessedAt: new Date() } : {}) } });
      const cart = await transaction.cart.findUnique({ where: { userId: payment.order.userId }, select: { id: true } });
      if (cart) {
        for (const item of payment.order.items) {
          if (!item.productId) continue;
          const cartItem = await transaction.cartItem.findUnique({ where: { cartId_productId: { cartId: cart.id, productId: item.productId } } });
          if (!cartItem) continue;
          if (cartItem.quantity <= item.quantity) await transaction.cartItem.delete({ where: { id: cartItem.id } });
          else await transaction.cartItem.update({ where: { id: cartItem.id }, data: { quantity: { decrement: item.quantity } } });
        }
      }
      return true;
    });

    if (newlyPaid) {
      const receipt = await prisma.order.findUnique({ where: { id: payment.orderId }, include: { user: { select: { email: true, firstName: true } }, items: true } });
      if (receipt?.user.email) {
        const escapeHtml = (text: string) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
        const rows = receipt.items.map((item) => `<li>${escapeHtml(item.name)} × ${item.quantity}: ₦${(item.unitPrice * item.quantity + item.installationFee).toLocaleString("en-NG")}</li>`).join("");
        try {
          await sendAccountEmail(receipt.user.email, `JFO Tech order ${receipt.reference} confirmed`, `<p>Hello ${escapeHtml(receipt.user.firstName ?? "" )},</p><p>Your payment is confirmed. Order reference: <strong>${escapeHtml(receipt.reference)}</strong>.</p><ul>${rows}</ul><p>Total paid: <strong>₦${receipt.total.toLocaleString("en-NG")}</strong></p><p>You can review your order from your JFO Tech account.</p>`);
        } catch (error) {
          console.error("Unable to send order confirmation email", error instanceof Error ? error.message : "Unknown mail error");
        }
      }
    }
  } catch (error) {
    console.error("Verified Paystack payment could not be committed", error instanceof Error ? error.message : "Unknown error");
    return { success: false as const, message: "Payment was verified but the order requires support." };
  }

  return { success: true as const, orderId: payment.orderId, reference: payment.order.reference };
}
