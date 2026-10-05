import Link from "next/link";
import type { ReactNode } from "react";

const navigation = [
  ["Overview", "/account"],
  ["Orders", "/account/orders"],
  ["Addresses", "/account/addresses"],
  ["Wishlist", "/account/wishlist"],
  ["Profile", "/account/profile"],
] as const;

export function AccountLayout({ children, active }: { children: ReactNode; active: string }) {
  return <div className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 sm:py-12">
    <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">My JFO Tech</p>
    <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">Your account</h1>
    <div className="mt-7 grid gap-8 md:grid-cols-[220px_1fr]">
      <nav aria-label="Account sections" className="flex gap-1 overflow-x-auto border-b border-border pb-1 md:block md:border-b-0 md:pb-0">
        {navigation.map(([label, href]) => <Link key={href} href={href} aria-current={active === href ? "page" : undefined} className={`shrink-0 border-b-2 px-3 py-3 text-sm font-semibold md:block md:border-b-0 md:border-l-2 md:px-4 ${active === href ? "border-primary bg-primary-tint text-primary" : "border-transparent text-muted hover:bg-surface hover:text-ink"}`}>{label}</Link>)}
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  </div>;
}