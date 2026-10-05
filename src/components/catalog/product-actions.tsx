"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import type { ProductCardData } from "@/lib/catalog";
import { useCartStore } from "@/stores/cart-store";
import { WishlistButton } from "@/components/catalog/wishlist-button";

export function AddToCartButton({ product, compact = false, quantity = 1 }: { product: ProductCardData; compact?: boolean; quantity?: number }) {
  const add = useCartStore((state) => state.add);
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  function addProduct() {
    add({ id: product.id, slug: product.slug, name: product.name, brand: product.brand, price: product.price, stock: product.stock, image: product.images[0]?.url ?? "/product-placeholder.svg", installationEligible: product.installationEligible, installationFee: product.installationFee }, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return <button type="button" onClick={addProduct} disabled={soldOut} className={`flex w-full items-center justify-center gap-2 font-bold transition-colors disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted ${compact ? "h-10 bg-ink text-xs text-white hover:bg-primary" : "min-h-12 bg-primary px-5 text-sm text-white hover:bg-primary-hover"}`}>
    {added ? <Check aria-hidden="true" size={17} /> : <ShoppingBag aria-hidden="true" size={17} />}{soldOut ? "Out of stock" : added ? "Added to cart" : "Add to cart"}
  </button>;
}

export function ProductPurchaseControls({ product, saved }: { product: ProductCardData; saved: boolean }) {
  const [quantity, setQuantity] = useState(1);
  return <div className="grid grid-cols-[auto_1fr_48px] gap-2">
    <div className="flex h-12 items-center border border-border">
      <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity <= 1} aria-label="Decrease quantity" className="grid size-10 place-items-center disabled:opacity-40"><Minus size={15}/></button>
      <label htmlFor="product-quantity" className="sr-only">Quantity</label><input id="product-quantity" type="number" min={1} max={product.stock} value={quantity} onChange={(event) => setQuantity(Math.min(product.stock, Math.max(1, Number(event.target.value) || 1)))} className="w-10 appearance-none text-center text-sm font-semibold outline-none" />
      <button type="button" onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))} disabled={quantity >= product.stock} aria-label="Increase quantity" className="grid size-10 place-items-center disabled:opacity-40"><Plus size={15}/></button>
    </div>
    <AddToCartButton product={product} quantity={quantity}/>
    <WishlistButton productId={product.id} initialSaved={saved}/>
  </div>;
}