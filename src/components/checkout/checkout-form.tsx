"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, MapPin, PackageCheck, ShieldCheck } from "lucide-react";
import { formatNaira } from "@/lib/catalog";
import { nigeriaLocations, nigeriaStates } from "@/lib/nigeria";
import { useCartStore } from "@/stores/cart-store";

type SavedAddress = { id: string; label: string; fullName: string; phone: string; street: string; street2: string | null; city: string; state: string; lga: string; postalCode: string | null; isDefault: boolean };

export function CheckoutForm({ addresses, deliveryFees, email }: { addresses: SavedAddress[]; deliveryFees: Record<string, number>; email: string }) {
  const items = useCartStore((state) => state.items);
  const hydrated = useCartStore((state) => state.hydrated);
  const [deliveryMethod, setDeliveryMethod] = useState<"DOOR" | "PICKUP">("DOOR");
  const [addressId, setAddressId] = useState(addresses.find((address) => address.isDefault)?.id ?? addresses[0]?.id ?? "");
  const [addingAddress, setAddingAddress] = useState(addresses.length === 0);
  const [state, setState] = useState(addresses.find((address) => address.isDefault)?.state ?? addresses[0]?.state ?? "");
  const [lga, setLga] = useState("");
  const [installProductIds, setInstallProductIds] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [preferredInstallAt, setPreferredInstallAt] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const selectedAddress = addresses.find((address) => address.id === addressId);
  const deliveryState = deliveryMethod === "DOOR" ? (addingAddress ? state : selectedAddress?.state ?? state) : state || "Lagos";
  const deliveryFee = deliveryMethod === "DOOR" ? deliveryFees[deliveryState] ?? 0 : 0;
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const installationFee = items.reduce((sum, item) => installProductIds.includes(item.product.id) ? sum + item.product.installationFee * item.quantity : sum, 0);
  const estimatedTotal = subtotal + deliveryFee + installationFee;
  const lgas = useMemo(() => nigeriaLocations[state] ?? [], [state]);

  function toggleInstallation(productId: string) {
    setInstallProductIds((current) => current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!items.length) { setError("Your cart is empty."); return; }
    if (deliveryMethod === "DOOR" && !addingAddress && !addressId) { setError("Choose a delivery address."); return; }
    if (deliveryMethod === "DOOR" && addingAddress && !lga) { setError("Select a local government area."); return; }

    const form = new FormData(event.currentTarget);
    const newAddress = addingAddress && deliveryMethod === "DOOR" ? {
      label: String(form.get("label") ?? "HOME"),
      fullName: String(form.get("fullName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      street: String(form.get("street") ?? ""),
      street2: String(form.get("street2") ?? ""),
      city: String(form.get("city") ?? ""),
      state,
      lga,
      postalCode: String(form.get("postalCode") ?? ""),
      isDefault: false,
    } : undefined;

    setSubmitting(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryMethod,
          deliveryState,
          addressId: !addingAddress && deliveryMethod === "DOOR" ? addressId : undefined,
          newAddress,
          pickupLocation: deliveryMethod === "PICKUP" ? "LAGOS_IKEJA" : undefined,
          installProductIds,
          preferredInstallAt: preferredInstallAt ? new Date(preferredInstallAt).toISOString() : undefined,
          couponCode: couponCode.trim() || undefined,
          customerNote: customerNote.trim() || undefined,
        }),
      });
      const result = await response.json() as { authorizationUrl?: string; error?: string };
      if (!response.ok || !result.authorizationUrl) { setError(result.error ?? "Checkout could not be started."); return; }
      window.location.assign(result.authorizationUrl);
    } catch {
      setError("Could not reach checkout. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!hydrated) return <p className="animate-pulse py-10 text-sm text-muted">Loading your cart…</p>;
  if (!items.length) return <div className="border border-dashed border-border p-8 text-center"><h2 className="text-lg font-bold">Your cart is empty</h2><Link href="/shop" className="mt-4 inline-flex h-11 items-center bg-primary px-5 text-sm font-bold text-white">Browse products</Link></div>;

  return <form onSubmit={submit} className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
    <div className="space-y-5">
      <section className="border border-border p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center bg-primary-tint text-primary"><MapPin size={18}/></span><div><h2 className="text-lg font-extrabold">Delivery</h2><p className="text-xs text-muted">Signed in as {email}</p></div></div>
        <fieldset className="mt-5 grid gap-3 sm:grid-cols-2"><legend className="sr-only">Delivery method</legend><label className={`flex cursor-pointer gap-3 border p-4 ${deliveryMethod === "DOOR" ? "border-primary bg-primary-tint/50" : "border-border"}`}><input type="radio" name="deliveryMethod" checked={deliveryMethod === "DOOR"} onChange={() => setDeliveryMethod("DOOR")} className="mt-1 accent-primary"/><span><span className="block text-sm font-bold">Door delivery</span><span className="mt-1 block text-xs text-muted">State-based delivery fee</span></span></label><label className={`flex cursor-pointer gap-3 border p-4 ${deliveryMethod === "PICKUP" ? "border-primary bg-primary-tint/50" : "border-border"}`}><input type="radio" name="deliveryMethod" checked={deliveryMethod === "PICKUP"} onChange={() => setDeliveryMethod("PICKUP")} className="mt-1 accent-primary"/><span><span className="block text-sm font-bold">Pickup station</span><span className="mt-1 block text-xs text-muted">No delivery fee</span></span></label></fieldset>
        {deliveryMethod === "PICKUP" ? <div className="mt-4 border border-border bg-surface p-4"><label htmlFor="pickup-location" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em]">Pickup location</label><select id="pickup-location" name="pickup-location" className="h-11 w-full border border-border bg-white px-3 text-sm"><option value="LAGOS_IKEJA">JFO Tech Pickup Point, Ikeja, Lagos</option></select><p className="mt-2 text-xs text-muted">We’ll contact you when your order is ready for collection.</p></div> : <div className="mt-4">
          {addresses.length > 0 && !addingAddress && <div><label htmlFor="saved-address" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em]">Saved address</label><select id="saved-address" value={addressId} onChange={(event) => setAddressId(event.target.value)} className="h-12 w-full border border-border bg-white px-3 text-sm">{addresses.map((address) => <option key={address.id} value={address.id}>{address.label} · {address.street}, {address.city} ({address.state}){address.isDefault ? " · Default" : ""}</option>)}</select><button type="button" onClick={() => setAddingAddress(true)} className="mt-2 text-xs font-semibold text-primary">Use a different address</button></div>}
          {addingAddress && <div className="grid gap-3 border border-border p-4 sm:grid-cols-2"><div><label htmlFor="new-address-label" className="mb-1 block text-xs font-semibold">Label</label><select id="new-address-label" name="label" className="h-11 w-full border border-border bg-white px-2 text-sm"><option value="HOME">Home</option><option value="WORK">Work</option><option value="OTHER">Other</option></select></div><div><label htmlFor="new-address-name" className="mb-1 block text-xs font-semibold">Recipient name</label><input id="new-address-name" name="fullName" required className="h-11 w-full border border-border px-2 text-sm"/></div><div><label htmlFor="new-address-phone" className="mb-1 block text-xs font-semibold">Phone number</label><input id="new-address-phone" name="phone" type="tel" required className="h-11 w-full border border-border px-2 text-sm"/></div><div><label htmlFor="new-address-street" className="mb-1 block text-xs font-semibold">Street address</label><input id="new-address-street" name="street" required className="h-11 w-full border border-border px-2 text-sm"/></div><div><label htmlFor="new-address-street2" className="mb-1 block text-xs font-semibold">Apartment / suite (optional)</label><input id="new-address-street2" name="street2" className="h-11 w-full border border-border px-2 text-sm"/></div><div><label htmlFor="new-address-city" className="mb-1 block text-xs font-semibold">City / town</label><input id="new-address-city" name="city" required className="h-11 w-full border border-border px-2 text-sm"/></div><div><label htmlFor="new-address-state" className="mb-1 block text-xs font-semibold">State</label><select id="new-address-state" value={state} onChange={(event) => { setState(event.target.value); setLga(""); }} className="h-11 w-full border border-border bg-white px-2 text-sm" required><option value="">Select a state</option>{nigeriaStates.map((item) => <option key={item}>{item}</option>)}</select></div><div><label htmlFor="new-address-lga" className="mb-1 block text-xs font-semibold">LGA</label><select id="new-address-lga" value={lga} onChange={(event) => setLga(event.target.value)} disabled={!state} className="h-11 w-full border border-border bg-white px-2 text-sm disabled:bg-surface" required><option value="">Select an LGA</option>{lgas.map((item) => <option key={item}>{item}</option>)}</select></div><div><label htmlFor="new-address-postal" className="mb-1 block text-xs font-semibold">Postal code (optional)</label><input id="new-address-postal" name="postalCode" className="h-11 w-full border border-border px-2 text-sm"/></div>{addresses.length > 0 && <button type="button" onClick={() => setAddingAddress(false)} className="self-end text-left text-xs font-semibold text-primary">Use a saved address instead</button>}</div>}
        </div>}
      </section>

      <section className="border border-border p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center bg-primary-tint text-primary"><PackageCheck size={18}/></span><div><h2 className="text-lg font-extrabold">Service options</h2><p className="text-xs text-muted">Professional installation is optional</p></div></div><div className="mt-4 divide-y divide-border">{items.map(({ product, quantity }) => <label key={product.id} className="flex items-start gap-3 py-3"><input type="checkbox" disabled={!product.installationEligible} checked={installProductIds.includes(product.id)} onChange={() => toggleInstallation(product.id)} className="mt-1 size-4 accent-primary disabled:opacity-40"/><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{product.name}</span><span className="mt-1 block text-xs text-muted">{product.installationEligible ? `Professional installation · ${formatNaira(product.installationFee)} per unit` : "Installation not available for this item"}</span></span><span className="text-xs text-muted">Qty {quantity}</span></label>)}</div>{installProductIds.length > 0 && <div className="mt-2 max-w-xs"><label htmlFor="install-date" className="mb-1.5 flex items-center gap-2 text-xs font-semibold"><CalendarDays size={14}/>Preferred installation date</label><input id="install-date" type="date" value={preferredInstallAt} onChange={(event) => setPreferredInstallAt(event.target.value)} className="h-11 w-full border border-border px-3 text-sm"/></div>}</section>

      <section className="border border-border p-5 sm:p-6"><h2 className="text-lg font-extrabold">Payment & notes</h2><div className="mt-4 border border-border bg-surface p-4"><div className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck size={17} className="text-primary"/>Secure payment with Paystack</div><p className="mt-1 text-xs leading-5 text-muted">Pay by card, bank transfer, or USSD on Paystack’s secure payment page.</p></div><div className="mt-4"><label htmlFor="checkout-coupon" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em]">Coupon code</label><input id="checkout-coupon" value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} placeholder="Enter coupon code" className="h-11 w-full border border-border px-3 text-sm sm:max-w-sm"/></div><div className="mt-4"><label htmlFor="checkout-note" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em]">Order note (optional)</label><textarea id="checkout-note" value={customerNote} onChange={(event) => setCustomerNote(event.target.value)} maxLength={1000} rows={3} className="w-full resize-y border border-border p-3 text-sm" placeholder="Anything our team should know?"/></div></section>
    </div>

    <aside className="h-fit border border-border p-5 sm:p-6"><h2 className="text-lg font-extrabold">Review your order</h2><div className="mt-4 max-h-60 space-y-3 overflow-y-auto border-y border-border py-4">{items.map(({ product, quantity }) => <div key={product.id} className="flex gap-3"><div className="relative size-12 shrink-0 bg-surface"><Image src={product.image} alt={product.name} fill sizes="48px" className="object-cover"/></div><div className="min-w-0 flex-1"><p className="line-clamp-2 text-xs font-semibold">{product.name}</p><p className="mt-1 text-[11px] text-muted">{quantity} × {formatNaira(product.price)}</p></div><p className="shrink-0 text-xs font-bold">{formatNaira(quantity * product.price)}</p></div>)}</div><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatNaira(subtotal)}</span></div><div className="flex justify-between"><span className="text-muted">Delivery</span><span>{deliveryMethod === "PICKUP" ? "Free" : deliveryState && deliveryFees[deliveryState] !== undefined ? formatNaira(deliveryFee) : "Select state"}</span></div>{installationFee > 0 && <div className="flex justify-between"><span className="text-muted">Installation</span><span>{formatNaira(installationFee)}</span></div>}<div className="flex justify-between border-t border-border pt-3 text-base font-extrabold"><span>Total estimate</span><span className="text-primary">{formatNaira(estimatedTotal)}</span></div></div><p className="mt-3 text-[11px] leading-5 text-muted">Final total is recalculated from current product prices, stock, delivery zone, and coupon on the server.</p>{error && <p role="alert" className="mt-4 border border-primary/20 bg-primary-tint p-3 text-sm text-primary">{error}</p>}<button type="submit" disabled={submitting || !items.length} className="mt-5 h-12 w-full bg-primary text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-60">{submitting ? "Preparing secure payment…" : "Place order and pay"}</button><p className="mt-3 text-center text-[11px] leading-5 text-muted">By placing your order, you agree to JFO Tech’s terms of sale.</p></aside>
  </form>;
}