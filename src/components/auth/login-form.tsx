"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { loginSchema } from "@/lib/validation";

type LoginValues = z.input<typeof loginSchema>;

export function LoginForm({ callbackUrl, googleEnabled }: { callbackUrl: string; googleEnabled: boolean }) {
  const router = useRouter();
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  async function submit(values: LoginValues) {
    const result = await signIn("credentials", { ...values, redirect: false, redirectTo: callbackUrl });
    if (result?.error) {
      form.setError("root", { message: "Email or password is incorrect, or your email has not been verified." });
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return <div>
    <form onSubmit={form.handleSubmit(submit)} noValidate className="space-y-4">
      <div><label htmlFor="login-email" className="mb-1.5 block text-sm font-semibold">Email address</label><input id="login-email" type="email" autoComplete="email" {...form.register("email")} className="h-12 w-full border border-border px-3 text-sm" aria-invalid={Boolean(form.formState.errors.email)} />{form.formState.errors.email && <p className="mt-1 text-xs text-primary">{form.formState.errors.email.message}</p>}</div>
      <div><div className="mb-1.5 flex items-center justify-between"><label htmlFor="login-password" className="text-sm font-semibold">Password</label><Link href="/forgot-password" className="text-xs font-semibold text-primary hover:text-primary-hover">Forgot password?</Link></div><input id="login-password" type="password" autoComplete="current-password" {...form.register("password")} className="h-12 w-full border border-border px-3 text-sm" aria-invalid={Boolean(form.formState.errors.password)} />{form.formState.errors.password && <p className="mt-1 text-xs text-primary">{form.formState.errors.password.message}</p>}</div>
      {form.formState.errors.root && <p role="alert" className="border border-primary/20 bg-primary-tint p-3 text-sm text-primary">{form.formState.errors.root.message}</p>}
      <button type="submit" disabled={form.formState.isSubmitting} className="h-12 w-full bg-primary text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-60">{form.formState.isSubmitting ? "Signing in…" : "Sign in"}</button>
    </form>
    <p className="mt-4 text-center text-xs text-muted">Need to verify your email? <Link href="/resend-verification" className="font-semibold text-primary">Send another link</Link></p>
    {googleEnabled && <><div className="my-5 flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-border" />or continue with<span className="h-px flex-1 bg-border" /></div><button type="button" onClick={() => signIn("google", { redirectTo: callbackUrl })} className="flex h-12 w-full items-center justify-center gap-3 border border-border text-sm font-semibold hover:bg-surface"><span className="font-bold text-primary">G</span>Continue with Google</button></>}
  </div>;
}