import Image from "next/image";
import Link from "next/link";
import type { ProductCardData } from "@/lib/catalog";
import { formatNaira, productImage } from "@/lib/catalog";
import { AddToCartButton } from "@/components/catalog/product-actions";
import { WishlistButton } from "@/components/catalog/wishlist-button";

export function ProductCard({ product, saved = false }: { product: ProductCardData; saved?: boolean }) {
  const discount = product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;
  return <article className="group min-w-0 border border-border bg-white transition-colors hover:border-ink/30">
    <div className="relative">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[1.05] overflow-hidden bg-surface"><Image src={productImage(product)} alt={product.images[0]?.alt ?? product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px" className="object-cover transition-transform duration-500 group-hover:scale-[1.035]" />
          {discount > 0 && <span className="absolute left-2 top-2 bg-primary px-2 py-1 text-[10px] font-bold text-white sm:left-3 sm:top-3">-{discount}%</span>}
          {product.stock <= 0 && <span className="absolute inset-x-0 bottom-0 bg-ink/80 px-3 py-2 text-center text-xs font-bold text-white">Out of stock</span>}
        </div>
        <div className="p-3 pb-2 sm:p-4 sm:pb-2"><p className="truncate text-[10px] font-medium uppercase tracking-[0.1em] text-muted">{product.brand} · {product.category.name}</p><h2 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold leading-5">{product.name}</h2><p className="mt-2 text-[15px] font-extrabold text-primary">{formatNaira(product.price)}</p>{product.compareAtPrice && <p className="mt-0.5 text-xs text-muted line-through">{formatNaira(product.compareAtPrice)}</p>}</div>
      </Link>
      <div className="absolute right-2 top-2 sm:right-3 sm:top-3"><WishlistButton productId={product.id} initialSaved={saved} /></div>
    </div>
    <div className="px-3 pb-3 sm:px-4 sm:pb-4"><AddToCartButton product={product} compact /></div>
  </article>;
}