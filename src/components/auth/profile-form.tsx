"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { profileSchema } from "@/lib/validation";
import { changePassword, updateProfile, type ActionResult } from "@/app/actions/auth";

type ProfileValues = z.input<typeof profileSchema>;

export function ProfileForm({ firstName, lastName, phone, email }: ProfileValues & { email: string }) {
  const [result, setResult] = useState<ActionResult | null>(null);
  const form = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: { firstName, lastName, phone: phone ?? "" } });
  async function submit(values: ProfileValues) { const response = await updateProfile(values); setResult(response); }
  return <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
    <div><label htmlFor="profile-email" className="mb-1.5 block text-sm font-semibold">Email address</label><input id="profile-email" type="email" value={email} readOnly className="h-12 w-full border border-border bg-surface px-3 text-sm text-muted" /><p className="mt-1 text-xs text-muted">Contact support to change your account email.</p></div>
    <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="profile-first" className="mb-1.5 block text-sm font-semibold">First name</label><input id="profile-first" autoComplete="given-name" {...form.register("firstName")} className="h-12 w-full border border-border px-3 text-sm" />{form.formState.errors.firstName && <p className="mt-1 text-xs text-primary">{form.formState.errors.firstName.message}</p>}</div><div><label htmlFor="profile-last" className="mb-1.5 block text-sm font-semibold">Last name</label><input id="profile-last" autoComplete="family-name" {...form.register("lastName")} className="h-12 w-full border border-border px-3 text-sm" />{form.formState.errors.lastName && <p className="mt-1 text-xs text-primary">{form.formState.errors.lastName.message}</p>}</div></div>
    <div><label htmlFor="profile-phone" className="mb-1.5 block text-sm font-semibold">Phone number</label><input id="profile-phone" type="tel" autoComplete="tel" {...form.register("phone")} className="h-12 w-full border border-border px-3 text-sm" />{form.formState.errors.phone && <p className="mt-1 text-xs text-primary">{form.formState.errors.phone.message}</p>}</div>
    {result && <p role="status" className={`p-3 text-sm ${result.ok ? "bg-emerald-50 text-emerald-800" : "bg-primary-tint text-primary"}`}>{result.message}</p>}
    <button disabled={form.formState.isSubmitting} className="h-11 bg-primary px-5 text-sm font-bold text-white hover:bg-primary-hover">Save changes</button>
  </form>;
}

export function ChangePasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [result, setResult] = useState<ActionResult | null>(null);
  const form = useForm<{ currentPassword: string; newPassword: string; confirm: string }>({ defaultValues: { currentPassword: "", newPassword: "", confirm: "" } });
  async function submit(values: { currentPassword: string; newPassword: string; confirm: string }) {
    if (values.newPassword !== values.confirm) { form.setError("confirm", { message: "Passwords do not match." }); return; }
    const response = await changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
    setResult(response);
    if (response.ok) form.reset();
  }
  return <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
    <h2 className="text-lg font-bold">{hasPassword ? "Change password" : "Set a password"}</h2>
    {hasPassword && <div><label htmlFor="current-password" className="mb-1.5 block text-sm font-semibold">Current password</label><input id="current-password" type="password" autoComplete="current-password" {...form.register("currentPassword", { required: true })} className="h-12 w-full border border-border px-3 text-sm" /></div>}
    <div><label htmlFor="change-password" className="mb-1.5 block text-sm font-semibold">New password</label><input id="change-password" type="password" autoComplete="new-password" {...form.register("newPassword", { required: true, minLength: 10 })} className="h-12 w-full border border-border px-3 text-sm" />{form.formState.errors.newPassword && <p className="mt-1 text-xs text-primary">Use at least 10 characters.</p>}</div>
    <div><label htmlFor="confirm-change-password" className="mb-1.5 block text-sm font-semibold">Confirm new password</label><input id="confirm-change-password" type="password" autoComplete="new-password" {...form.register("confirm", { required: true })} className="h-12 w-full border border-border px-3 text-sm" />{form.formState.errors.confirm && <p className="mt-1 text-xs text-primary">{form.formState.errors.confirm.message}</p>}</div>
    {result && <p role="status" className={`p-3 text-sm ${result.ok ? "bg-emerald-50 text-emerald-800" : "bg-primary-tint text-primary"}`}>{result.message}</p>}
    <button className="h-11 border border-ink px-5 text-sm font-bold hover:bg-surface">Update password</button>
  </form>;
}