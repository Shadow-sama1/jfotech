import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { auth } from "@/auth";
import { PrintReceiptButton } from "@/components/checkout/print-receipt-button";
import { formatNaira } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order confirmation" };

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=%2Faccount%2Forders");
  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: { items: true, address: true, payments: { where: { status: "SUCCESS" }, orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!order) notFound();

  return <div className="mx-auto max-w-[850px] px-5 py-8 sm:px-8 sm:py-12 print:max-w-none print:px-0 print:py-0">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden"><Link href="/account/orders" className="text-sm font-semibold text-muted hover:text-primary">← Your orders</Link><PrintReceiptButton/></div>
    <section className="border border-border p-5 sm:p-8 print:border-0 print:p-0"><div className="flex items-start gap-4 border-b border-border pb-6"><CheckCircle2 className={`mt-1 shrink-0 ${order.status === "PAID" ? "text-emerald-700" : "text-primary"}`} size={30}/><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">{order.status === "PAID" ? "Payment confirmed" : "Order received"}</p><h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em]">Thank you for your order</h1><p className="mt-2 text-sm text-muted">Reference <span className="font-bold text-ink">{order.reference}</span> · {new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(order.createdAt)}</p></div></div>
  <div className="grid gap-6 py-6 sm:grid-cols-2"><div><h2 className="text-xs font-bold uppercase tracking-[0.1em]">Delivery</h2>{order.deliveryMethod === "DOOR" && order.address ? <p className="mt-2 text-sm leading-6">{order.address.fullName}<br/>{order.address.street}{order.address.street2 ? `, ${order.address.street2}` : ""}<br/>{order.address.city}, {order.address.lga}, {order.address.state}<br/>{order.address.phone}</p> : <p className="mt-2 text-sm leading-6">Pickup<br/>{order.pickupLocation}</p>}</div><div><h2 className="text-xs font-bold uppercase tracking-[0.1em]">Payment</h2><p className="mt-2 text-sm">{order.status === "PAID" ? `Paid ${order.payments[0] ? new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(order.payments[0].paidAt ?? order.createdAt) : ""}` : "Payment is being confirmed."}</p></div></div>
  <div className="border-y border-border"><h2 className="py-4 text-sm font-bold">Items</h2>{order.items.map((item) => <div key={item.id} className="flex justify-between gap-4 border-t border-border py-3 text-sm"><span>{item.name} × {item.quantity}{item.installation && <span className="block text-xs text-muted">Professional installation</span>}</span><span className="shrink-0 font-semibold">{formatNaira(item.unitPrice * item.quantity + item.installationFee)}</span></div>)}</div>
  <div className="ml-auto mt-5 max-w-xs space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatNaira(order.subtotal)}</span></div><div className="flex justify-between"><span className="text-muted">Delivery</span><span>{formatNaira(order.deliveryFee)}</span></div>{order.installationFee > 0 && <div className="flex justify-between"><span className="text-muted">Installation</span><span>{formatNaira(order.installationFee)}</span></div>}{order.discount > 0 && <div className="flex justify-between"><span className="text-muted">Discount</span><span>-{formatNaira(order.discount)}</span></div>}<div className="flex justify-between border-t border-border pt-3 text-base font-extrabold"><span>Total</span><span className="text-primary">{formatNaira(order.total)}</span></div></div>
  <p className="mt-7 text-xs leading-5 text-muted print:hidden">A confirmation will be sent to your email. You can view order progress from your account.</p><div className="mt-5 flex flex-wrap gap-3 print:hidden"><Link href="/account/orders" className="inline-flex h-11 items-center bg-ink px-5 text-sm font-bold text-white">View order history</Link><Link href="/shop" className="inline-flex h-11 items-center border border-border px-5 text-sm font-semibold">Continue shopping</Link></div>
+    </section>
+  </div>;
}
