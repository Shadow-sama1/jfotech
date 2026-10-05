"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { toggleWishlist } from "@/app/actions/account";

export function WishlistButton({ productId, initialSaved = false }: { productId: string; initialSaved?: boolean }) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function toggle() {
    startTransition(async () => {
      const result = await toggleWishlist(productId);
      if (!result.ok && result.message.includes("Sign in")) {
        router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }
      if (result.ok) setSaved(Boolean(result.saved));
    });
  }

  return <button type="button" onClick={toggle} disabled={pending} aria-label={saved ? "Remove from wishlist" : "Add to wishlist"} aria-pressed={saved} title={saved ? "Remove from wishlist" : "Add to wishlist"} className={`grid size-9 place-items-center border border-border bg-white/95 transition-colors hover:border-primary hover:text-primary disabled:opacity-60 ${saved ? "text-primary" : "text-ink"}`}><Heart aria-hidden="true" size={17} fill={saved ? "currentColor" : "none"} /></button>;
}