"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  image: string;
  installationEligible: boolean;
  installationFee: number;
};

export type CartLine = { product: CartProduct; quantity: number };

type CartState = {
  items: CartLine[];
  drawerOpen: boolean;
  hydrated: boolean;
  add: (product: CartProduct, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  replaceItems: (items: CartLine[]) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  setHydrated: (hydrated: boolean) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      drawerOpen: false,
      hydrated: false,
      add: (product, quantity = 1) => set((state) => {
        const existing = state.items.find((line) => line.product.id === product.id);
        if (existing) {
          return {
            items: state.items.map((line) => line.product.id === product.id
              ? { ...line, product, quantity: Math.min(product.stock, line.quantity + quantity) }
              : line),
            drawerOpen: true,
          };
        }
        if (product.stock < 1) return state;
        return { items: [...state.items, { product, quantity: Math.min(product.stock, Math.max(1, quantity)) }], drawerOpen: true };
      }),
      setQuantity: (productId, quantity) => set((state) => ({
        items: quantity <= 0
          ? state.items.filter((line) => line.product.id !== productId)
          : state.items.map((line) => line.product.id === productId
            ? { ...line, quantity: Math.min(line.product.stock, Math.max(1, quantity)) }
            : line),
      })),
      remove: (productId) => set((state) => ({ items: state.items.filter((line) => line.product.id !== productId) })),
      replaceItems: (items) => set({ items }),
      clear: () => set({ items: [] }),
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "jfo-tech-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }) as CartState,
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);

export const getCartCount = (items: CartLine[]) => items.reduce((count, item) => count + item.quantity, 0);
export const getCartSubtotal = (items: CartLine[]) => items.reduce((subtotal, item) => subtotal + item.product.price * item.quantity, 0);