"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Heart, Menu, Search, UserRound, X } from "lucide-react";
import { CartButton } from "@/components/cart/cart-drawer";

const categories = ["Solar panels", "Inverters", "Batteries", "Charge controllers", "Complete systems"];

function Logo() {
  return <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="JFO Tech home">
    <span className="relative grid size-10 place-items-center">
      <span className="sun-mark absolute inset-0 rounded-full" />
      <svg className="relative z-10" width="25" height="25" viewBox="0 0 25 25" fill="none" aria-hidden="true">
        <circle cx="12.5" cy="12.5" r="5" fill="currentColor" />
        <path d="M12.5 1v3M12.5 21v3M1 12.5h3M21 12.5h3M4.37 4.37l2.12 2.12m12.02 12.02 2.12 2.12m0-16.26-2.12 2.12M6.49 18.51l-2.12 2.12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    </span>
    <span className="text-[19px] font-extrabold leading-none tracking-[-0.04em] text-white">JFO <span className="text-primary">TECH</span></span>
  </Link>;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const drawerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const previousPath = useRef(pathname);

  useEffect(() => {
    if (previousPath.current !== pathname) setOpen(false);
    previousPath.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = drawerRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input');
    focusable?.[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
      if (event.key === "Tab" && focusable?.length) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return <header className="sticky top-0 z-40 bg-ink text-white shadow-[0_2px_12px_rgb(0_0_0/12%)]">
    <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between gap-5 px-4 pr-16 sm:px-7 sm:pr-16 lg:h-[78px] lg:px-10">
      <Logo />
      <form role="search" action="/shop" className="hidden max-w-[550px] flex-1 items-center overflow-hidden rounded-[3px] bg-white lg:flex">
        <input name="q" type="search" placeholder="Search solar products, brands and more" className="h-11 min-w-0 flex-1 px-4 text-sm text-ink outline-none placeholder:text-muted" aria-label="Search products" />
        <button className="grid h-11 w-12 place-items-center bg-primary text-white transition-colors hover:bg-primary-hover" aria-label="Submit search"><Search aria-hidden="true" size={20} /></button>
      </form>
      <div className="hidden items-center gap-6 lg:flex">
        <Link href="/login" className="flex items-center gap-2 text-sm hover:text-primary"><UserRound aria-hidden="true" size={20} /><span>Account</span></Link>
        <Link href="/account/wishlist" className="relative grid size-10 place-items-center hover:text-primary" aria-label="Wishlist"><Heart aria-hidden="true" size={20} /></Link>
        <CartButton />
      </div>
      <div className="flex items-center gap-1 lg:hidden">
        <Link href="/shop" className="grid size-10 place-items-center" aria-label="Search products"><Search aria-hidden="true" size={20} /></Link>
        <CartButton />
      </div>
    </div>
    <nav aria-label="Product categories" className="hidden border-t border-white/10 lg:block">
      <div className="mx-auto flex h-11 max-w-[1440px] items-center gap-8 px-10 text-[13px] font-medium text-white/85">
        {categories.map((category, index) => <Link key={category} href={index === 4 ? "/shop?category=complete-systems" : `/shop?category=${category.toLowerCase().replaceAll(" ", "-")}`} className="transition-colors hover:text-white">{category}</Link>)}
        <Link href="/services" className="ml-auto text-primary hover:text-white">Installation & services</Link>
      </div>
    </nav>
    <button ref={triggerRef} type="button" onClick={() => setOpen(true)} aria-label="Open navigation menu" aria-expanded={open} aria-controls="mobile-navigation" className="fixed right-3 top-3 z-[60] grid size-11 place-items-center rounded-sm bg-primary text-white shadow-md transition-colors hover:bg-primary-hover lg:hidden">
      <Menu aria-hidden="true" size={20} />
    </button>
    <div aria-hidden={!open} onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }} className={`fixed inset-0 z-50 bg-ink/55 transition-opacity lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}>
      <aside ref={drawerRef} id="mobile-navigation" inert={!open} role="dialog" aria-modal="true" aria-label="Navigation menu" className={`ml-auto flex h-dvh w-[min(88vw,390px)] flex-col overflow-y-auto bg-white text-ink shadow-xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex h-[68px] items-center justify-between bg-ink px-5 text-white">
          <Logo />
          <button type="button" onClick={() => { setOpen(false); triggerRef.current?.focus(); }} className="grid size-10 place-items-center" aria-label="Close navigation menu"><X aria-hidden="true" size={20} /></button>
        </div>
        <form role="search" action="/shop" className="m-5 flex overflow-hidden border border-border">
          <input name="q" type="search" placeholder="Search products" className="h-11 min-w-0 flex-1 px-3 text-sm outline-none" aria-label="Search products" />
          <button className="grid w-11 place-items-center bg-primary text-white" aria-label="Submit search"><Search aria-hidden="true" size={18} /></button>
        </form>
        <div className="px-5 pb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Shop by category</div>
        <nav aria-label="Mobile product categories" className="border-b border-border px-5 pb-4">
          {categories.map((category, index) => <Link key={category} href={index === 4 ? "/shop?category=complete-systems" : `/shop?category=${category.toLowerCase().replaceAll(" ", "-")}`} className="flex min-h-11 items-center justify-between border-t border-border text-sm font-medium">{category}<span aria-hidden="true" className="text-muted">›</span></Link>)}
        </nav>
        <div className="px-5 pb-3 pt-5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Your account</div>
        <nav aria-label="Account navigation" className="px-5">
          {[ ["My Account", "/account"], ["Login / Register", "/login"], ["Orders", "/account/orders"], ["Wishlist", "/account/wishlist"], ["Contact", "/contact"] ].map(([label, href]) => <Link key={href} href={href} className="flex min-h-11 items-center border-t border-border text-sm font-medium">{label}</Link>)}
        </nav>
        <div className="mt-auto bg-surface p-5 text-xs leading-5 text-muted">Need a hand choosing a system?<br /><Link href="/services" className="mt-1 inline-block font-semibold text-primary">Talk to a solar expert</Link></div>
      </aside>
    </div>
  </header>;
}