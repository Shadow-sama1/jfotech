import Link from "next/link";
import { auth } from "@/auth";
import { ProductCard } from "@/components/catalog/product-card";
import { AccountLayout } from "@/lib/account-page";
import { productCardInclude } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AccountWishlistPage() {
  const session = await auth();
  const wishlist = await prisma.wishlistItem.findMany({ where: { userId: session!.user.id, product: { isPublished: true } }, include: { product: { include: productCardInclude } }, orderBy: { createdAt: "desc" } });
  return <AccountLayout active="/account/wishlist">{wishlist.length ? <><h2 className="mb-5 text-xl font-bold">Saved products</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">{wishlist.map(({ product }) => <ProductCard key={product.id} product={product} saved />)}</div></> : <div className="border border-dashed border-border px-5 py-12 text-center"><h2 className="text-lg font-bold">Your wishlist is empty</h2><p className="mt-2 text-sm text-muted">Save products you are interested in and find them here later.</p><Link href="/shop" className="mt-5 inline-flex h-11 items-center bg-primary px-5 text-sm font-bold text-white hover:bg-primary-hover">Find products</Link></div>}</AccountLayout>;
}