import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { RetryPaymentButton } from "@/components/checkout/retry-payment-button";
import { AccountLayout } from "@/lib/account-page";
import { formatNaira } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AccountOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  const order = await prisma.order.findFirst({ where: { id, userId: session!.user.id }, include: { items: true, address: true, payments: { orderBy: { createdAt: "desc" }, take: 1 } } });
  if (!order) notFound();

  return <AccountLayout active="/account/orders"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Order details</p><h2 className="mt-1 text-xl font-extrabold">{order.reference}</h2><p className="mt-1 text-sm text-muted">Placed {new Intl.DateTimeFormat("en-NG", { dateStyle: "long" }).format(order.createdAt)}</p></div><span className={`bg-surface px-3 py-2 text-xs font-bold uppercase ${order.status === "PAID" ? "text-emerald-700" : "text-primary"}`}>{order.status.toLowerCase().replaceAll("_", " ")}</span></div>
    <div className="mt-5 divide-y divide-border border-y border-border">{order.items.map((item) => <div key={item.id} className="flex justify-between gap-4 py-4 text-sm"><div><p className="font-semibold">{item.name}</p><p className="mt-1 text-xs text-muted">SKU {item.sku} · Qty {item.quantity}{item.installation ? " · Installation requested" : ""}</p></div><span className="shrink-0 font-bold">{formatNaira(item.unitPrice * item.quantity + item.installationFee)}</span></div>)}</div>
    <div className="ml-auto mt-5 max-w-sm space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted">Items subtotal</span><span>{formatNaira(order.subtotal)}</span></div><div className="flex justify-between"><span className="text-muted">Delivery</span><span>{formatNaira(order.deliveryFee)}</span></div>{order.installationFee > 0 && <div className="flex justify-between"><span className="text-muted">Installation</span><span>{formatNaira(order.installationFee)}</span></div>}{order.discount > 0 && <div className="flex justify-between"><span className="text-muted">Discount</span><span>-{formatNaira(order.discount)}</span></div>}<div className="flex justify-between border-t border-border pt-3 font-extrabold"><span>Total</span><span className="text-primary">{formatNaira(order.total)}</span></div></div>
    <div className="mt-6 border border-border p-4"><h3 className="text-sm font-bold">Delivery details</h3>{order.deliveryMethod === "DOOR" && order.address ? <p className="mt-2 text-sm leading-6">{order.address.fullName}<br/>{order.address.street}{order.address.street2 ? `, ${order.address.street2}` : ""}<br/>{order.address.city}, {order.address.lga}, {order.address.state}<br/>{order.address.phone}</p> : <p className="mt-2 text-sm">Pickup · {order.pickupLocation}</p>}{order.preferredInstallAt && <p className="mt-2 text-sm text-muted">Preferred installation date: {new Intl.DateTimeFormat("en-NG", { dateStyle: "long" }).format(order.preferredInstallAt)}</p>}</div>
    {order.status === "PENDING" && <div className="mt-6"><RetryPaymentButton orderId={order.id}/></div>}
    {order.payments[0] && <p className="mt-4 text-xs text-muted">Latest payment: {order.payments[0].status.toLowerCase()} · {order.payments[0].reference}</p>}
    </AccountLayout>;
}