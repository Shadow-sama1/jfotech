import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

function safeCallbackUrl(value: string | string[] | undefined) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/account";
  return value;
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const [session, params] = await Promise.all([auth(), searchParams]);
  const callbackUrl = safeCallbackUrl(params.callbackUrl);
  if (session?.user) redirect(callbackUrl);
  const registered = params.registered === "1";

  return <div className="mx-auto grid min-h-[calc(100dvh-230px)] max-w-[1080px] items-center gap-10 px-5 py-10 sm:px-8 md:grid-cols-[0.9fr_1.1fr] lg:py-16">
    <div className="hidden bg-ink p-10 text-white md:block"><p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">Welcome back</p><h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-[-0.04em]">Your energy journey, all in one place.</h1><p className="mt-4 text-sm leading-6 text-white/65">Manage your JFO Tech profile, saved addresses, and orders.</p><Link href="/" className="mt-8 inline-flex min-h-11 items-center border border-white/30 px-4 text-sm font-semibold hover:bg-white/10">Back to shopping</Link></div>
    <div className="mx-auto w-full max-w-[460px] py-3"><p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">Customer account</p><h2 className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">Sign in</h2><p className="mt-2 text-sm text-muted">Access your JFO Tech account.</p>{registered && <p role="status" className="mt-5 bg-primary-tint p-3 text-sm text-primary">Account created. Please verify your email before signing in.</p>}<div className="mt-6"><LoginForm callbackUrl={callbackUrl} googleEnabled={Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)} /></div><p className="mt-6 text-center text-sm text-muted">New to JFO Tech? <Link href="/register" className="font-bold text-primary hover:text-primary-hover">Create an account</Link></p></div>
  </div>;
}