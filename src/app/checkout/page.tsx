import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=%2Fcheckout");
  if (!process.env.DATABASE_URL) return <div className="mx-auto max-w-3xl px-5 py-16 text-center"><h1 className="text-3xl font-extrabold">Checkout setup required</h1><p className="mt-3 text-sm text-muted">Configure DATABASE_URL, apply migrations, and seed delivery zones before checkout.</p></div>;

  const [user, addresses, zones] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { email: true } }),
    prisma.address.findMany({ where: { userId: session.user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] }),
    prisma.deliveryZone.findMany({ where: { isActive: true }, select: { state: true, fee: true } }),
  ]);
  return <div className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 sm:py-12 lg:px-10"><p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">Checkout</p><h1 className="mt-2 mb-6 text-3xl font-extrabold tracking-[-0.04em]">Delivery and payment</h1><CheckoutForm addresses={addresses} deliveryFees={Object.fromEntries(zones.map(({ state, fee }) => [state, fee]))} email={user?.email ?? session.user.email ?? ""}/></div>;
}