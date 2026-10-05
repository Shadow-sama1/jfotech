import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/account-actions";

export const metadata: Metadata = { title: "Set a new password" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  return <div className="mx-auto max-w-[480px] px-5 py-14 sm:px-8 sm:py-20"><p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">Account support</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">Choose a new password</h1><p className="mt-3 text-sm leading-6 text-muted">Use a unique password with at least 10 characters.</p><div className="mt-7 border border-border p-5 sm:p-7">{token.length === 64 ? <ResetPasswordForm token={token} /> : <p role="alert" className="bg-primary-tint p-4 text-sm text-primary">This reset link is invalid or incomplete. Request a new one from the sign-in page.</p>}</div></div>;
}