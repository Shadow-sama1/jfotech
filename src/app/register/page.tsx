import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create an account" };

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/account");

  return <div className="mx-auto max-w-[560px] px-5 py-10 sm:px-8 sm:py-14"><p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">Join JFO Tech</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">Create your account</h1><p className="mt-2 text-sm text-muted">Save your details and stay up to date with your orders.</p><div className="mt-7 border border-border bg-white p-5 sm:p-8"><RegisterForm /></div><p className="mt-5 text-center text-sm text-muted">Already have an account? <Link href="/login" className="font-bold text-primary">Sign in</Link></p></div>;
}