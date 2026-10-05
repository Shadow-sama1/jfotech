import { z } from "zod";
import { auth } from "@/auth";
import { consumeRateLimit } from "@/lib/auth-rate-limit";
import { prisma } from "@/lib/prisma";
import { initializePayment } from "@/lib/paystack";
import { OrderStatus, PaymentStatus } from "@prisma/client";

const requestSchema = z.object({ orderId: z.string().min(1) });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in to retry payment." }, { status: 401 });
  if (!(await consumeRateLimit(`payment-retry:${session.user.id}`, 5, 10 * 60_000))) return Response.json({ error: "Too many payment attempts. Try again later." }, { status: 429 });
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid order." }, { status: 400 });

  const order = await prisma.order.findFirst({ where: { id: parsed.data.orderId, userId: session.user.id } });
  if (!order) return Response.json({ error: "Order not found." }, { status: 404 });
  if (order.status !== OrderStatus.PENDING) return Response.json({ error: "This order is no longer awaiting payment." }, { status: 409 });

  const latestPayment = await prisma.payment.findFirst({ where: { orderId: order.id }, orderBy: { createdAt: "desc" } });
  if (latestPayment?.status === PaymentStatus.PENDING && latestPayment.authorizationUrl) return Response.json({ authorizationUrl: latestPayment.authorizationUrl });

  try {
    const payment = await initializePayment(order.id);
    return Response.json(payment, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Payment retry failed", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "A new payment session could not be started. Please try again." }, { status: 502 });
  }
}
