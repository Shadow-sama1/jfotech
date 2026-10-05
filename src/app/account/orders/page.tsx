import Link from "next/link";
import { auth } from "@/auth";
import { AccountLayout } from "@/lib/account-page";
import { formatNaira } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AccountOrdersPage() {
  const session = await auth();
  const orders = await prisma.order.findMany({ where: { userId: session!.user.id }, include: { items: { take: 2 }, _count: { select: { items: true } } }, orderBy: { createdAt: "desc" }, take: 50 });
  return <AccountLayout active="/account/orders"><h2 className="mb-5 text-xl font-bold">Order history</h2>{orders.length ? <div className="divide-y divide-border border-y border-border">{orders.map((order) => <article key={order.id} className="flex flex-wrap items-center justify-between gap-4 py-4"><div><Link href={`/account/orders/${order.id}`} className="text-sm font-bold hover:text-primary">{order.reference}</Link><p className="mt-1 text-xs text-muted">{new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(order.createdAt)} · {order._count.items} item{order._count.items === 1 ? "" : "s"}</p><p className="mt-2 text-xs text-muted">{order.items.map((item) => item.name).join(", ")}{order._count.items > order.items.length ? ` and ${order._count.items - order.items.length} more` : ""}</p></div><div className="flex items-center gap-4"><div className="text-right"><p className="text-sm font-extrabold">{formatNaira(order.total)}</p><p className={`mt-1 text-xs font-bold ${order.status === "PAID" || order.status === "DELIVERED" ? "text-emerald-700" : order.status === "PENDING" ? "text-primary" : "text-muted"}`}>{order.status.toLowerCase().replaceAll("_", " ")}</p></div><Link href={`/account/orders/${order.id}`} className="text-sm font-semibold text-primary">Details</Link></div></article>)}</div> : <div className="border border-dashed border-border px-5 py-12 text-center"><h3 className="text-lg font-bold">No orders yet</h3><p className="mt-2 text-sm text-muted">Your orders and payment status will appear here.</p><Link href="/shop" className="mt-5 inline-flex h-11 items-center bg-primary px-5 text-sm font-bold text-white">Explore the shop</Link></div>}</AccountLayout>;
}