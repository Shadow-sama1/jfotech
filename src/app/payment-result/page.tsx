import type { Metadata } from "next";
import Link from "next/link";
import { CircleAlert } from "lucide-react";

export const metadata: Metadata = { title: "Payment not confirmed" };

export default async function PaymentResultPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;
  const success = params.status === "success";
  return <div className="mx-auto max-w-[620px] px-5 py-16 text-center sm:px-8 sm:py-24"><CircleAlert className="mx-auto text-primary" size={38}/><p className="mt-5 text-xs font-bold uppercase tracking-[0.15em] text-primary">{success ? "Payment received" : "Payment not confirmed"}</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">{success ? "We’re confirming your order" : "Your order is still pending"}</h1><p className="mt-3 text-sm leading-6 text-muted">{success ? "Your payment is being verified securely. Check your order history for the latest status." : "No completed payment was confirmed. You can retry securely from your order details."}</p><div className="mt-6 flex justify-center gap-3"><Link href="/account/orders" className="inline-flex h-11 items-center bg-primary px-5 text-sm font-bold text-white">View my orders</Link><Link href="/cart" className="inline-flex h-11 items-center border border-border px-5 text-sm font-semibold">Return to cart</Link></div></div>;
}