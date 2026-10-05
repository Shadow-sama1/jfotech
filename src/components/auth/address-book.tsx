"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { deleteAddress, saveAddress, setDefaultAddress } from "@/app/actions/account";
import { addressSchema } from "@/lib/validation";
import { nigeriaLocations, nigeriaStates } from "@/lib/nigeria";
import type { Address } from "@prisma/client";

type AddressValues = z.input<typeof addressSchema>;

function AddressForm({ onSaved }: { onSaved: () => void }) {
  const [message, setMessage] = useState("");
  const form = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { label: "HOME", fullName: "", phone: "", street: "", street2: "", city: "", state: "", lga: "", postalCode: "", isDefault: false },
  });
  const selectedState = useWatch({ control: form.control, name: "state" });
  const lgas = nigeriaLocations[selectedState] ?? [];

  async function submit(values: AddressValues) {
    const result = await saveAddress(values);
    setMessage(result.message);
    if (result.ok) { form.reset(); onSaved(); }
  }

  return <form onSubmit={form.handleSubmit(submit)} className="grid gap-4 border border-border p-4 sm:grid-cols-2 sm:p-5">
    <div><label htmlFor="address-label" className="mb-1.5 block text-sm font-semibold">Address label</label><select id="address-label" {...form.register("label")} className="h-12 w-full border border-border bg-white px-3 text-sm"><option value="HOME">Home</option><option value="WORK">Work</option><option value="OTHER">Other</option></select></div>
    <div><label htmlFor="address-name" className="mb-1.5 block text-sm font-semibold">Recipient full name</label><input id="address-name" autoComplete="name" {...form.register("fullName")} className="h-12 w-full border border-border px-3 text-sm" />{form.formState.errors.fullName && <p className="mt-1 text-xs text-primary">{form.formState.errors.fullName.message}</p>}</div>
    <div><label htmlFor="address-phone" className="mb-1.5 block text-sm font-semibold">Phone number</label><input id="address-phone" type="tel" autoComplete="tel" {...form.register("phone")} className="h-12 w-full border border-border px-3 text-sm" />{form.formState.errors.phone && <p className="mt-1 text-xs text-primary">{form.formState.errors.phone.message}</p>}</div>
    <div><label htmlFor="address-street" className="mb-1.5 block text-sm font-semibold">Street address</label><input id="address-street" autoComplete="address-line1" {...form.register("street")} className="h-12 w-full border border-border px-3 text-sm" />{form.formState.errors.street && <p className="mt-1 text-xs text-primary">{form.formState.errors.street.message}</p>}</div>
    <div><label htmlFor="address-street2" className="mb-1.5 block text-sm font-semibold">Apartment, suite, etc. <span className="font-normal text-muted">Optional</span></label><input id="address-street2" autoComplete="address-line2" {...form.register("street2")} className="h-12 w-full border border-border px-3 text-sm" /></div>
    <div><label htmlFor="address-city" className="mb-1.5 block text-sm font-semibold">City / town</label><input id="address-city" autoComplete="address-level2" {...form.register("city")} className="h-12 w-full border border-border px-3 text-sm" /></div>
    <div><label htmlFor="address-state" className="mb-1.5 block text-sm font-semibold">State</label><select id="address-state" autoComplete="address-level1" {...form.register("state", { onChange: () => form.setValue("lga", "") })} className="h-12 w-full border border-border bg-white px-3 text-sm"><option value="">Select a state</option>{nigeriaStates.map((state) => <option key={state}>{state}</option>)}</select></div>
    <div><label htmlFor="address-lga" className="mb-1.5 block text-sm font-semibold">Local government area</label><select id="address-lga" {...form.register("lga")} disabled={!selectedState} className="h-12 w-full border border-border bg-white px-3 text-sm disabled:bg-surface"><option value="">Select an LGA</option>{lgas.map((lga) => <option key={lga}>{lga}</option>)}</select>{form.formState.errors.lga && <p className="mt-1 text-xs text-primary">Select an LGA.</p>}</div>
    <div><label htmlFor="address-postal" className="mb-1.5 block text-sm font-semibold">Postal code <span className="font-normal text-muted">Optional</span></label><input id="address-postal" autoComplete="postal-code" {...form.register("postalCode")} className="h-12 w-full border border-border px-3 text-sm" /></div>
    <label className="flex min-h-11 items-center gap-3 text-sm sm:col-span-2"><input type="checkbox" {...form.register("isDefault")} className="size-4 accent-primary" />Set as my default delivery address</label>
    {message && <p role="status" className="bg-primary-tint p-3 text-sm text-primary sm:col-span-2">{message}</p>}
    <button disabled={form.formState.isSubmitting} className="h-11 w-fit bg-primary px-5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-60">{form.formState.isSubmitting ? "Saving…" : "Save address"}</button>
  </form>;
}

export function AddressBook({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState("");
  const reload = () => router.refresh();

  async function setDefault(id: string) { const result = await setDefaultAddress(id); setFeedback(result.message); if (result.ok) reload(); }
  async function remove(id: string) { const result = await deleteAddress(id); setFeedback(result.message); if (result.ok) reload(); }

  return <div className="space-y-5">
    {feedback && <p role="status" className="bg-primary-tint p-3 text-sm text-primary">{feedback}</p>}
    {addresses.length ? <div className="grid gap-3 sm:grid-cols-2">{addresses.map((address) => <article key={address.id} className="border border-border p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="text-sm font-bold">{address.label.toLowerCase()} {address.isDefault && <span className="ml-1 bg-primary-tint px-2 py-1 text-[10px] uppercase text-primary">Default</span>}</h2><p className="mt-3 text-sm font-semibold">{address.fullName}</p><p className="mt-1 text-sm leading-5 text-muted">{address.street}{address.street2 ? `, ${address.street2}` : ""}<br />{address.city}, {address.lga}, {address.state}{address.postalCode ? ` ${address.postalCode}` : ""}<br />{address.phone}</p></div></div><div className="mt-4 flex gap-4 border-t border-border pt-3">{!address.isDefault && <button onClick={() => setDefault(address.id)} className="text-xs font-semibold text-primary">Set as default</button>}<button onClick={() => remove(address.id)} className="text-xs font-semibold text-muted hover:text-primary">Remove</button></div></article>)}</div> : <div className="border border-dashed border-border px-5 py-8 text-center"><h2 className="text-base font-bold">No saved addresses</h2><p className="mt-2 text-sm text-muted">Add a delivery address for faster checkout.</p></div>}
    {!adding ? <button type="button" onClick={() => setAdding(true)} className="h-11 border border-ink px-5 text-sm font-bold hover:bg-surface">Add a new address</button> : <div><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">Add an address</h2><button onClick={() => setAdding(false)} className="text-sm font-semibold text-muted">Cancel</button></div><AddressForm onSaved={reload} /></div>}
  </div>;
}