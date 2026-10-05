"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/stores/cart-store";

export function CartSync() {
  const pathname = usePathname();
  const hydrated = useCartStore((state) => state.hydrated);
  const replaceItems = useCartStore((state) => state.replaceItems);
  const attemptedPath = useRef("");
  const authenticated = useRef(false);

  useEffect(() => {
    if (!hydrated || attemptedPath.current === pathname) return;
    attemptedPath.current = pathname;
    let cancelled = false;

    async function synchronize() {
      try {
        const existing = await fetch("/api/cart", { cache: "no-store" });
        if (existing.status === 401) return;
        if (!existing.ok) return;
        const serverCart = await existing.json() as { items: unknown[] | null };
        if (!serverCart.items) return;

        const localItems = useCartStore.getState().items;
        if (localItems.length && !authenticated.current) {
          authenticated.current = true;
          const merged = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: localItems.map((item) => ({ productId: item.product.id, quantity: item.quantity })) }),
          });
          if (!merged.ok) return;
          const result = await merged.json() as { items: typeof serverCart.items };
          if (!cancelled) replaceItems(result.items as Parameters<typeof replaceItems>[0]);
        } else if (!cancelled) {
          authenticated.current = true;
          replaceItems(serverCart.items as Parameters<typeof replaceItems>[0]);
        }
      } catch {
        // Keep the local cart available when the account service is offline.
      }
    }

    void synchronize();
    return () => { cancelled = true; };
  }, [hydrated, pathname, replaceItems]);

  useEffect(() => {
    if (!hydrated) return;
    let timeout: number | undefined;
    const unsubscribe = useCartStore.subscribe((state, previous) => {
      if (!authenticated.current || state.items === previous.items) return;
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        void fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: state.items.map((item) => ({ productId: item.product.id, quantity: item.quantity })) }),
        });
      }, 250);
    });
    return () => { window.clearTimeout(timeout); unsubscribe(); };
  }, [hydrated]);

  return null;
}