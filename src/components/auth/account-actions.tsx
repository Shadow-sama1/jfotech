"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { requestPasswordReset, resendVerificationEmail, resetPassword, verifyEmail, type ActionResult } from "@/app/actions/auth";

export function ResendVerificationForm() {
  const [result, setResult] = useState<ActionResult | null>(null);
  const form = useForm<{ email: string }>({ defaultValues: { email: "" } });
  async function submit(values: { email: string }) { setResult(await resendVerificationEmail(values.email)); }
  return <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
    <div><label htmlFor="verify-email" className="mb-1.5 block text-sm font-semibold">Email address</label><input id="verify-email" type="email" autoComplete="email" required {...form.register("email")} className="h-12 w-full border border-border px-3 text-sm" /></div>
    {result && <p role="status" className="bg-primary-tint p-3 text-sm text-primary">{result.message}</p>}
    <button disabled={form.formState.isSubmitting} className="h-12 w-full bg-primary text-sm font-bold text-white hover:bg-primary-hover">{form.formState.isSubmitting ? "Sending…" : "Send verification link"}</button>
    <p className="text-center text-sm text-muted"><Link href="/login" className="font-semibold text-primary">Back to sign in</Link></p>
  </form>;
}

export function ForgotPasswordForm() {
  const [result, setResult] = useState<ActionResult | null>(null);
  const form = useForm<{ email: string }>({ defaultValues: { email: "" } });
  async function submit(values: { email: string }) { setResult(await requestPasswordReset(values.email)); }
  return <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
    <div><label htmlFor="forgot-email" className="mb-1.5 block text-sm font-semibold">Email address</label><input id="forgot-email" type="email" autoComplete="email" required {...form.register("email")} className="h-12 w-full border border-border px-3 text-sm" /></div>
    {result && <p role="status" className="bg-primary-tint p-3 text-sm text-primary">{result.message}</p>}
    <button disabled={form.formState.isSubmitting} className="h-12 w-full bg-primary text-sm font-bold text-white hover:bg-primary-hover">{form.formState.isSubmitting ? "Sending…" : "Send reset link"}</button>
    <p className="text-center text-sm text-muted"><Link href="/login" className="font-semibold text-primary">Back to sign in</Link></p>
  </form>;
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [result, setResult] = useState<ActionResult | null>(null);
  const form = useForm<{ password: string; confirm: string }>({ defaultValues: { password: "", confirm: "" } });
  async function submit(values: { password: string; confirm: string }) {
    if (values.password !== values.confirm) { form.setError("confirm", { message: "Passwords do not match." }); return; }
    const response = await resetPassword({ token, password: values.password });
    setResult(response);
  }
  return <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
    <div><label htmlFor="new-password" className="mb-1.5 block text-sm font-semibold">New password</label><input id="new-password" type="password" autoComplete="new-password" {...form.register("password", { required: true, minLength: 10 })} className="h-12 w-full border border-border px-3 text-sm" />{form.formState.errors.password && <p className="mt-1 text-xs text-primary">Use at least 10 characters.</p>}</div>
    <div><label htmlFor="confirm-password" className="mb-1.5 block text-sm font-semibold">Confirm password</label><input id="confirm-password" type="password" autoComplete="new-password" {...form.register("confirm", { required: true })} className="h-12 w-full border border-border px-3 text-sm" />{form.formState.errors.confirm && <p className="mt-1 text-xs text-primary">{form.formState.errors.confirm.message}</p>}</div>
    {result && <p role="status" className="bg-primary-tint p-3 text-sm text-primary">{result.message}</p>}
    {result?.ok ? <Link href="/login" className="inline-flex h-12 w-full items-center justify-center bg-primary text-sm font-bold text-white">Go to sign in</Link> : <button disabled={form.formState.isSubmitting} className="h-12 w-full bg-primary text-sm font-bold text-white hover:bg-primary-hover">Update password</button>}
  </form>;
}

export function VerifyEmailButton({ token }: { token: string }) {
  const [result, setResult] = useState<ActionResult | null>(null);
  async function verify() { setResult(await verifyEmail(token)); }
  return <div className="text-center">
    {result ? <><p role="status" className="bg-primary-tint p-4 text-sm text-primary">{result.message}</p>{result.ok && <Link href="/login" className="mt-5 inline-flex h-12 items-center bg-primary px-6 text-sm font-bold text-white">Go to sign in</Link>}</> : <button type="button" onClick={verify} className="h-12 bg-primary px-6 text-sm font-bold text-white hover:bg-primary-hover">Verify email address</button>}
  </div>;
}