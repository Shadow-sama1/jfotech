import { auth } from "@/auth";
import { ChangePasswordForm, ProfileForm } from "@/components/auth/profile-form";
import { AccountLayout } from "@/lib/account-page";
import { prisma } from "@/lib/prisma";

export default async function AccountProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUnique({ where: { id: session!.user.id }, select: { firstName: true, lastName: true, phone: true, email: true, passwordHash: true } });
  if (!user?.email) return null;
  return <AccountLayout active="/account/profile"><div className="border border-border p-5 sm:p-6"><h2 className="mb-5 text-lg font-bold">Personal information</h2><ProfileForm firstName={user.firstName ?? ""} lastName={user.lastName ?? ""} phone={user.phone ?? ""} email={user.email} /></div><div className="mt-5 border border-border p-5 sm:p-6"><ChangePasswordForm hasPassword={Boolean(user.passwordHash)} /></div></AccountLayout>;
}