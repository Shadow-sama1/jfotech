"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { formatNaira } from "@/lib/catalog";
import { getCartCount, getCartSubtotal, useCartStore } from "@/stores/cart-store";

export function CartButton() {
  const count = useCartStore((state) => getCartCount(state.items));
  const openDrawer = useCartStore((state) => state.openDrawer);
  const hydrated = useCartStore((state) => state.hydrated);
  return <button type="button" onClick={openDrawer} aria-label={`Shopping cart, ${hydrated ? count : 0} items`} className="relative grid size-10 place-items-center hover:text-primary"><ShoppingBag aria-hidden="true" size={20} /><span className="absolute right-0 top-0 grid size-[17px] place-items-center rounded-full bg-primary text-[10px] font-bold text-white">{hydrated ? count : 0}</span></button>;
}

export function CartDrawer() {
  const open = useCartStore((state) => state.drawerOpen);
  const items = useCartStore((state) => state.items);
  const close = useCartStore((state) => state.closeDrawer);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);
  const hydrated = useCartStore((state) => state.hydrated);
  const subtotal = getCartSubtotal(items);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKeyDown); };
  }, [close, open]);

  return <div aria-hidden={!open} onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }} className={`fixed inset-0 z-[80] bg-ink/55 transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}>
    <aside role="dialog" aria-modal="true" aria-label="Your shopping cart" className={`ml-auto flex h-dvh w-[min(94vw,460px)] flex-col bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
      <div className="flex items-center justify-between border-b border-border px-5 py-4"><div><h2 className="text-lg font-extrabold">Your cart</h2><p className="mt-0.5 text-xs text-muted">{hydrated ? `${getCartCount(items)} item${getCartCount(items) === 1 ? "" : "s"}` : ""}</p></div><button type="button" onClick={close} aria-label="Close cart" className="grid size-10 place-items-center hover:bg-surface"><X size={20} /></button></div>
      {!hydrated ? <div className="grid flex-1 place-items-center text-sm text-muted">Loading your cart…</div> : items.length === 0 ? <div className="grid flex-1 place-items-center px-6 text-center"><div><ShoppingBag className="mx-auto text-muted" size={35} /><h3 className="mt-4 text-lg font-bold">Your cart is empty</h3><p className="mt-2 text-sm text-muted">Find the right solar equipment for your needs.</p><Link href="/shop" onClick={close} className="mt-5 inline-flex h-11 items-center bg-primary px-5 text-sm font-bold text-white hover:bg-primary-hover">Explore the shop</Link></div></div> : <>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">{items.map((line) => <article key={line.product.id} className="flex gap-3 border-b border-border pb-4"><Link href={`/product/${line.product.slug}`} onClick={close} className="relative size-[88px] shrink-0 overflow-hidden bg-surface"><Image src={line.product.image} alt={line.product.name} fill sizes="88px" className="object-cover" /></Link><div className="min-w-0 flex-1"><Link href={`/product/${line.product.slug}`} onClick={close} className="line-clamp-2 text-sm font-semibold hover:text-primary">{line.product.name}</Link><p className="mt-1 text-xs text-muted">{line.product.brand}</p><p className="mt-2 text-sm font-extrabold text-primary">{formatNaira(line.product.price)}</p><div className="mt-2 flex items-center gap-2"><button type="button" onClick={() => setQuantity(line.product.id, line.quantity - 1)} aria-label={`Decrease ${line.product.name} quantity`} className="grid size-7 place-items-center border border-border"><Minus size={13} /></button><span className="min-w-5 text-center text-xs font-semibold">{line.quantity}</span><button type="button" onClick={() => setQuantity(line.product.id, line.quantity + 1)} disabled={line.quantity >= line.product.stock} aria-label={`Increase ${line.product.name} quantity`} className="grid size-7 place-items-center border border-border disabled:opacity-40"><Plus size={13} /></button><button type="button" onClick={() => remove(line.product.id)} aria-label={`Remove ${line.product.name}`} className="ml-auto grid size-7 place-items-center text-muted hover:text-primary"><Trash2 size={15} /></button></div></div></article>)}</div>
        <div className="border-t border-border p-5"><div className="flex justify-between text-sm"><span className="text-muted">Subtotal</span><span className="font-extrabold">{formatNaira(subtotal)}</span></div><p className="mt-2 text-xs leading-5 text-muted">Delivery fees and any applicable discounts are calculated at checkout.</p><Link href="/cart" onClick={close} className="mt-4 inline-flex h-12 w-full items-center justify-center bg-primary text-sm font-bold text-white hover:bg-primary-hover">View cart</Link><button type="button" onClick={close} className="mt-2 h-10 w-full text-sm font-semibold text-muted hover:text-ink">Continue shopping</button></div>
      </>}
    </aside>
  </div>;
}