import type { Metadata } from "next";
import { ResendVerificationForm } from "@/components/auth/account-actions";

export const metadata: Metadata = { title: "Resend verification email" };

export default function ResendVerificationPage() {
  return <div className="mx-auto max-w-[480px] px-5 py-14 sm:px-8 sm:py-20"><p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">Account support</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">Resend verification</h1><p className="mt-3 text-sm leading-6 text-muted">Enter your email address and we’ll send a new verification link if needed.</p><div className="mt-7 border border-border p-5 sm:p-7"><ResendVerificationForm /></div></div>;
}