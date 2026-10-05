import { auth } from "@/auth";
import { AddressBook } from "@/components/auth/address-book";
import { AccountLayout } from "@/lib/account-page";
import { prisma } from "@/lib/prisma";

export default async function AccountAddressesPage() {
  const session = await auth();
  const addresses = await prisma.address.findMany({ where: { userId: session!.user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] });
  return <AccountLayout active="/account/addresses"><div className="mb-5"><h2 className="text-xl font-bold">Address book</h2><p className="mt-1 text-sm text-muted">Save Nigerian delivery locations for a smoother checkout.</p></div><AddressBook addresses={addresses} /></AccountLayout>;
}