import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { productCardInclude } from "@/lib/catalog";

const mergeSchema = z.object({
  items: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(99) })).max(100),
});

async function readCart(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: { include: productCardInclude } } } },
  });
  return cart?.items.map((item) => ({
    product: {
      id: item.product.id,
      slug: item.product.slug,
      name: item.product.name,
      brand: item.product.brand,
      price: item.product.price,
      stock: item.product.stock,
      image: item.product.images[0]?.url ?? "/product-placeholder.svg",
      installationEligible: item.product.installationEligible,
      installationFee: item.product.installationFee,
    },
    quantity: Math.min(item.quantity, item.product.stock),
  })).filter((item) => item.quantity > 0) ?? [];
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ items: null }, { headers: { "Cache-Control": "private, no-store" } });
  return Response.json({ items: await readCart(session.user.id) }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in required." }, { status: 401 });
  const parsed = mergeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid cart data." }, { status: 400 });

  await prisma.$transaction(async (transaction) => {
    const products = await transaction.product.findMany({
      where: { id: { in: parsed.data.items.map((item) => item.productId) }, isPublished: true },
      select: { id: true, stock: true },
    });
    const stockById = new Map(products.map((product) => [product.id, product.stock]));
    const cart = await transaction.cart.upsert({ where: { userId: session.user.id }, create: { userId: session.user.id }, update: {} });

    for (const item of parsed.data.items) {
      const stock = stockById.get(item.productId);
      if (!stock || stock < 1) continue;
      const existing = await transaction.cartItem.findUnique({ where: { cartId_productId: { cartId: cart.id, productId: item.productId } } });
      const quantity = Math.min(stock, (existing?.quantity ?? 0) + item.quantity);
      await transaction.cartItem.upsert({
        where: { cartId_productId: { cartId: cart.id, productId: item.productId } },
        create: { cartId: cart.id, productId: item.productId, quantity },
        update: { quantity },
      });
    }
  });

  return Response.json({ items: await readCart(session.user.id) }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in required." }, { status: 401 });
  const parsed = mergeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid cart data." }, { status: 400 });

  await prisma.$transaction(async (transaction) => {
    const cart = await transaction.cart.upsert({ where: { userId: session.user.id }, create: { userId: session.user.id }, update: {} });
    const quantities = new Map<string, number>();
    for (const item of parsed.data.items) quantities.set(item.productId, Math.min(99, (quantities.get(item.productId) ?? 0) + item.quantity));
    const products = await transaction.product.findMany({ where: { id: { in: [...quantities.keys()] }, isPublished: true, stock: { gt: 0 } }, select: { id: true, stock: true } });
    const stockById = new Map(products.map((product) => [product.id, product.stock]));
    await transaction.cartItem.deleteMany({ where: { cartId: cart.id } });
    const data = [...quantities.entries()].flatMap(([productId, quantity]) => {
      const stock = stockById.get(productId);
      return stock ? [{ cartId: cart.id, productId, quantity: Math.min(stock, quantity) }] : [];
    });
    if (data.length) await transaction.cartItem.createMany({ data });
  });

  return Response.json({ items: await readCart(session.user.id) }, { headers: { "Cache-Control": "private, no-store" } });
}