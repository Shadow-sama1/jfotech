import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { ProductPurchaseControls } from "@/components/catalog/product-actions";
import { ProductCard } from "@/components/catalog/product-card";
import { formatNaira } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug, isPublished: true },
    include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!process.env.DATABASE_URL) return { title: "Product catalog unavailable" };
  const product = await getProduct(slug);
  return product ? {
    title: product.name,
    description: product.shortDescription,
    openGraph: { title: product.name, description: product.shortDescription, images: product.images[0] ? [product.images[0].url] : [] },
  } : { title: "Product not found" };
}

function specifications(value: unknown): [string, string][] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string");
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!process.env.DATABASE_URL) return <div className="mx-auto max-w-[720px] px-5 py-16 text-center"><p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">Catalog setup required</p><h1 className="mt-2 text-3xl font-extrabold">Product details are unavailable</h1><p className="mt-3 text-sm leading-6 text-muted">Configure DATABASE_URL, apply the Prisma migration, and seed the catalog to browse products.</p><Link href="/shop" className="mt-5 inline-flex h-11 items-center bg-primary px-5 text-sm font-bold text-white">Go to shop</Link></div>;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [session, related, reviews] = await Promise.all([
    auth(),
    prisma.product.findMany({ where: { isPublished: true, categoryId: product.categoryId, id: { not: product.id } }, include: { category: { select: { name: true, slug: true } }, images: { orderBy: { sortOrder: "asc" }, take: 1 } }, orderBy: [{ popularity: "desc" }, { createdAt: "desc" }], take: 4 }),
    prisma.review.findMany({ where: { productId: product.id, isVisible: true }, include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 8 }),
  ]);
  const saved = session?.user?.id ? Boolean(await prisma.wishlistItem.findUnique({ where: { userId_productId: { userId: session.user.id, productId: product.id } }, select: { id: true } })) : false;
  const image = product.images[0]?.url ?? "/product-placeholder.svg";
  const discount = product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;
  const specs = specifications(product.specifications);

  return <div className="mx-auto max-w-[1280px] px-5 py-7 sm:px-8 sm:py-10 lg:px-10">
    <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted"><Link href="/" className="hover:text-primary">Home</Link><span>/</span><Link href="/shop" className="hover:text-primary">Shop</Link><span>/</span><Link href={`/category/${product.category.slug}`} className="hover:text-primary">{product.category.name}</Link><span>/</span><span className="text-ink">{product.name}</span></nav>
    <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
      <div className="relative aspect-square max-h-[620px] overflow-hidden bg-surface"><Image src={image} alt={product.images[0]?.alt ?? product.name} fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />{discount > 0 && <span className="absolute left-4 top-4 bg-primary px-3 py-1.5 text-xs font-bold text-white">SAVE {discount}%</span>}</div>
      <div className="lg:py-3"><p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{product.brand} · {product.category.name}</p><h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-[-0.04em] sm:text-4xl">{product.name}</h1><p className="mt-3 text-sm leading-6 text-muted">{product.shortDescription}</p>
        <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1"><span className="text-3xl font-extrabold text-primary">{formatNaira(product.price)}</span>{product.compareAtPrice && <><span className="text-base text-muted line-through">{formatNaira(product.compareAtPrice)}</span><span className="text-xs font-bold text-primary">Save {formatNaira(product.compareAtPrice - product.price)}</span></>}</div>
        <div className="mt-4 flex items-center gap-2 text-sm"><span className={`size-2 rounded-full ${product.stock > 0 ? "bg-emerald-600" : "bg-primary"}`} /><span className="font-semibold">{product.stock > 0 ? "In stock" : "Out of stock"}</span>{product.stock > 0 && <span className="text-muted">· {product.stock} available</span>}</div>
        {product.warranty && <p className="mt-2 text-sm text-muted">Warranty: <span className="font-semibold text-ink">{product.warranty}</span></p>}
        <div className="mt-6"><ProductPurchaseControls product={{ ...product, images: product.images.slice(0, 1), category: { name: product.category.name, slug: product.category.slug } }} saved={saved} /></div>
        <div className="mt-7 border-t border-border pt-5"><h2 className="text-sm font-bold">Product details</h2><p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted">{product.description}</p></div>
        {specs.length > 0 && <div className="mt-6"><h2 className="mb-2 text-sm font-bold">Specifications</h2><dl className="divide-y divide-border border-y border-border">{specs.map(([key, value]) => <div key={key} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-4 py-3 text-sm"><dt className="text-muted">{key.replaceAll(/([A-Z])/g, " $1")}</dt><dd className="font-medium">{value}</dd></div>)}</dl></div>}
        <p className="mt-5 text-xs leading-5 text-muted">Solar system sizing depends on your appliances and usage. Contact our team for product compatibility or installation guidance.</p>
      </div>
    </div>
    {reviews.length > 0 && <section className="mt-12 border-t border-border pt-8"><p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">Customer feedback</p><h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">Product reviews</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{reviews.map((review) => <article key={review.id} className="border border-border p-4"><p aria-label={`${review.rating} out of 5 stars`} className="text-sm tracking-[0.12em] text-primary">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>{review.title && <h3 className="mt-2 text-sm font-bold">{review.title}</h3>}<p className="mt-2 text-sm leading-6 text-muted">{review.content}</p><p className="mt-3 text-xs font-semibold">{review.user.name ?? "JFO Tech customer"}</p></article>)}</div></section>}
    {related.length > 0 && <section className="mt-14 border-t border-border pt-8"><p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">Explore more</p><h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">Related products</h2><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></section>}
  </div>;
}