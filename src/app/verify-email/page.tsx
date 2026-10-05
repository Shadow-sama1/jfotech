import type { Metadata } from "next";
import { VerifyEmailButton } from "@/components/auth/account-actions";

export const metadata: Metadata = { title: "Verify your email" };

export default async function VerifyEmailPage({ searchParams }: PageProps<"/verify-email">) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  return <div className="mx-auto max-w-[500px] px-5 py-16 text-center sm:px-8 sm:py-24"><p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">One last step</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">Verify your email</h1><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted">Confirm your email address to activate your JFO Tech account. Verification links expire after one hour.</p><div className="mt-7">{token.length === 64 ? <VerifyEmailButton token={token} /> : <p role="alert" className="bg-primary-tint p-4 text-sm text-primary">This verification link is invalid or incomplete.</p>}</div></div>;
}