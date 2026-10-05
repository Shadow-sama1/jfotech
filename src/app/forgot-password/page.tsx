import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/account-actions";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return <div className="mx-auto max-w-[480px] px-5 py-14 sm:px-8 sm:py-20"><p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">Account support</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">Reset your password</h1><p className="mt-3 text-sm leading-6 text-muted">Enter the email address on your account. We’ll send a reset link if the account is eligible.</p><div className="mt-7 border border-border p-5 sm:p-7"><ForgotPasswordForm /></div></div>;
}