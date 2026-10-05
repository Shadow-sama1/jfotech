import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { AccountLayout } from "@/lib/account-page";
import { prisma } from "@/lib/prisma";

export default async function AccountDashboard() {
  const session = await auth();
  const [user, addressCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: session!.user.id }, select: { firstName: true, name: true } }),
    prisma.address.count({ where: { userId: session!.user.id } }),
  ]);
  const firstName = user?.firstName ?? user?.name?.split(" ")[0] ?? "there";

  return <AccountLayout active="/account"><div className="flex items-start justify-between gap-4"><div><p className="text-sm text-muted">Welcome back,</p><h2 className="mt-1 text-2xl font-extrabold">{firstName}</h2><p className="mt-2 text-sm text-muted">Manage your account details and saved delivery information.</p></div><SignOutButton /></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><Link href="/account/orders" className="border border-border p-5 transition-colors hover:border-primary"><h3 className="text-sm font-bold">Your orders</h3><p className="mt-2 text-sm text-muted">Review order history and status updates.</p><span className="mt-4 inline-block text-sm font-semibold text-primary">View orders →</span></Link><Link href="/account/addresses" className="border border-border p-5 transition-colors hover:border-primary"><h3 className="text-sm font-bold">Saved addresses</h3><p className="mt-2 text-sm text-muted">{addressCount ? `${addressCount} saved delivery address${addressCount === 1 ? "" : "es"}.` : "Add a delivery address to speed up checkout."}</p><span className="mt-4 inline-block text-sm font-semibold text-primary">Manage addresses →</span></Link><Link href="/account/profile" className="border border-border p-5 transition-colors hover:border-primary"><h3 className="text-sm font-bold">Profile & security</h3><p className="mt-2 text-sm text-muted">Update your contact details or password.</p><span className="mt-4 inline-block text-sm font-semibold text-primary">Edit profile →</span></Link><Link href="/account/wishlist" className="border border-border p-5 transition-colors hover:border-primary"><h3 className="text-sm font-bold">Wishlist</h3><p className="mt-2 text-sm text-muted">Keep track of products you are considering.</p><span className="mt-4 inline-block text-sm font-semibold text-primary">View wishlist →</span></Link></div></AccountLayout>;
}