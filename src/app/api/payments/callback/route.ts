import { NextResponse, type NextRequest } from "next/server";
import { verifyAndCompletePayment } from "@/lib/paystack";

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference") ?? request.nextUrl.searchParams.get("trxref");
  if (!reference) return NextResponse.redirect(new URL("/payment-result?status=failed&reason=missing-reference", request.url));

  try {
    const result = await verifyAndCompletePayment(reference);
    if (result.success) return NextResponse.redirect(new URL(`/order-confirmation/${result.orderId}`, request.url));
  } catch (error) {
    console.error("Paystack callback verification failed", error instanceof Error ? error.message : "Unknown error");
  }

  return NextResponse.redirect(new URL(`/payment-result?status=failed&reference=${encodeURIComponent(reference)}`, request.url));
}
