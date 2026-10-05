"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return <button type="button" onClick={() => signOut({ redirectTo: "/" })} className="min-h-10 border border-border px-4 text-sm font-semibold text-muted hover:border-primary hover:text-primary">Sign out</button>;
}