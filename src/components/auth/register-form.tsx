"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { registerSchema } from "@/lib/validation";
import { registerAccount, type ActionResult } from "@/app/actions/auth";

type RegisterValues = z.input<typeof registerSchema>;

export function RegisterForm() {
  const [result, setResult] = useState<ActionResult | null>(null);
  const form = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), defaultValues: { firstName: "", lastName: "", email: "", phone: "", password: "" } });

  async function submit(values: RegisterValues) {
    setResult(null);
    const response = await registerAccount(values);
    setResult(response);
    if (!response.ok && response.fieldErrors) {
      for (const [field, messages] of Object.entries(response.fieldErrors)) {
        if (messages?.[0]) form.setError(field as keyof RegisterValues, { message: messages[0] });
      }
    }
    if (response.ok) form.reset();
  }

  if (result?.ok) return <div role="status" className="border border-emerald-700/20 bg-emerald-50 p-5"><p className="font-bold text-emerald-800">Account created</p><p className="mt-2 text-sm leading-6 text-emerald-800">{result.message}</p><Link href="/login" className="mt-4 inline-flex min-h-10 items-center bg-primary px-4 text-sm font-bold text-white hover:bg-primary-hover">Go to sign in</Link></div>;

  return <form onSubmit={form.handleSubmit(submit)} noValidate className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2">
      <div><label htmlFor="first-name" className="mb-1.5 block text-sm font-semibold">First name</label><input id="first-name" autoComplete="given-name" {...form.register("firstName")} className="h-12 w-full border border-border px-3 text-sm" aria-invalid={Boolean(form.formState.errors.firstName)} />{form.formState.errors.firstName && <p className="mt-1 text-xs text-primary">{form.formState.errors.firstName.message}</p>}</div>
      <div><label htmlFor="last-name" className="mb-1.5 block text-sm font-semibold">Last name</label><input id="last-name" autoComplete="family-name" {...form.register("lastName")} className="h-12 w-full border border-border px-3 text-sm" aria-invalid={Boolean(form.formState.errors.lastName)} />{form.formState.errors.lastName && <p className="mt-1 text-xs text-primary">{form.formState.errors.lastName.message}</p>}</div>
    </div>
    <div><label htmlFor="register-email" className="mb-1.5 block text-sm font-semibold">Email address</label><input id="register-email" type="email" autoComplete="email" {...form.register("email")} className="h-12 w-full border border-border px-3 text-sm" aria-invalid={Boolean(form.formState.errors.email)} />{form.formState.errors.email && <p className="mt-1 text-xs text-primary">{form.formState.errors.email.message}</p>}</div>
    <div><label htmlFor="register-phone" className="mb-1.5 block text-sm font-semibold">Phone number</label><input id="register-phone" type="tel" autoComplete="tel" placeholder="+234 800 000 0000" {...form.register("phone")} className="h-12 w-full border border-border px-3 text-sm" aria-invalid={Boolean(form.formState.errors.phone)} />{form.formState.errors.phone && <p className="mt-1 text-xs text-primary">{form.formState.errors.phone.message}</p>}</div>
    <div><label htmlFor="register-password" className="mb-1.5 block text-sm font-semibold">Password</label><input id="register-password" type="password" autoComplete="new-password" {...form.register("password")} className="h-12 w-full border border-border px-3 text-sm" aria-invalid={Boolean(form.formState.errors.password)} /><p className="mt-1 text-xs text-muted">Use 10 to 72 characters.</p>{form.formState.errors.password && <p className="mt-1 text-xs text-primary">{form.formState.errors.password.message}</p>}</div>
    {result && !result.ok && <p role="alert" className="border border-primary/20 bg-primary-tint p-3 text-sm text-primary">{result.message}</p>}
    <button type="submit" disabled={form.formState.isSubmitting} className="h-12 w-full bg-primary text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-60">{form.formState.isSubmitting ? "Creating account…" : "Create account"}</button>
    <p className="text-center text-xs leading-5 text-muted">By creating an account, you agree to our <Link href="/terms" className="font-semibold text-primary">Terms</Link> and <Link href="/privacy" className="font-semibold text-primary">Privacy Policy</Link>.</p>
  </form>;
}