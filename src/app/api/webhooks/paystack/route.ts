import { validatePaystackSignature, verifyAndCompletePayment } from "@/lib/paystack";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");
  try {
    if (!validatePaystackSignature(rawBody, signature)) return Response.json({ error: "Invalid webhook signature." }, { status: 401 });
  } catch {
    return Response.json({ error: "Webhook verification is not configured." }, { status: 503 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(rawBody) as typeof event;
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }
  if (event.event !== "charge.success") return Response.json({ received: true });
  if (!event.data?.reference) return Response.json({ error: "Missing payment reference." }, { status: 400 });

  try {
    const result = await verifyAndCompletePayment(event.data.reference, true);
    if (!result.success) return Response.json({ error: result.message }, { status: 409 });
    return Response.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook processing failed", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
