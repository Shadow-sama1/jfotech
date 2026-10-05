import Link from "next/link";
import { ProductCard } from "@/components/catalog/product-card";
import type { ProductCardData } from "@/lib/catalog";
import type { CatalogParams } from "@/lib/catalog-query";

type FilterOptions = { categories: { name: string; slug: string }[]; brands: string[]; capacities: string[] };

function queryWith(params: CatalogParams, updates: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && value && !["page"].includes(key)) query.set(key, value);
  }
  for (const [key, value] of Object.entries(updates)) {
    if (value) query.set(key, value);
    else query.delete(key);
  }
  return query.toString();
}

export function CatalogListing({ title, intro, products, total, page, params, filters, fixedCategory, catalogUnavailable = false }: {
  title: string;
  intro?: string | null;
  products: ProductCardData[];
  total: number;
  page: number;
  params: CatalogParams;
  filters: FilterOptions;
  fixedCategory?: string;
  catalogUnavailable?: boolean;
}) {
  const pages = Math.max(1, Math.ceil(total / 12));
  const currentCategory = fixedCategory ?? (Array.isArray(params.category) ? params.category[0] : params.category);
  const start = total ? (page - 1) * 12 + 1 : 0;
  const end = Math.min(page * 12, total);

  return <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
    <div className="border-b border-border pb-6"><p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">JFO Tech shop</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">{title}</h1>{intro && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{intro}</p>}</div>
    <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="h-fit border-b border-border pb-5 lg:border-b-0 lg:pb-0">
        <form action={fixedCategory ? `/category/${fixedCategory}` : "/shop"} className="grid grid-cols-2 gap-3 lg:block lg:space-y-5">
          {currentCategory && <input type="hidden" name="category" value={currentCategory} />}
          <div className="col-span-2 lg:col-span-1"><label htmlFor="filter-category" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em]">Category</label><select id="filter-category" name="category" defaultValue={currentCategory ?? ""} disabled={Boolean(fixedCategory)} className="h-10 w-full border border-border bg-white px-2 text-sm disabled:bg-surface">{!fixedCategory && <option value="">All categories</option>}{filters.categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select></div>
          <div><label htmlFor="filter-brand" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em]">Brand</label><select id="filter-brand" name="brand" defaultValue={typeof params.brand === "string" ? params.brand : ""} className="h-10 w-full border border-border bg-white px-2 text-sm"><option value="">All brands</option>{filters.brands.map((brand) => <option key={brand}>{brand}</option>)}</select></div>
          <div><label htmlFor="filter-capacity" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em]">Capacity / rating</label><select id="filter-capacity" name="capacity" defaultValue={typeof params.capacity === "string" ? params.capacity : ""} className="h-10 w-full border border-border bg-white px-2 text-sm"><option value="">Any rating</option>{filters.capacities.map((capacity) => <option key={capacity}>{capacity}</option>)}</select></div>
          <fieldset className="col-span-2 lg:col-span-1"><legend className="mb-1.5 text-xs font-bold uppercase tracking-[0.1em]">Price range (₦)</legend><div className="flex gap-2"><input name="minPrice" type="number" min="0" placeholder="Min" defaultValue={typeof params.minPrice === "string" ? params.minPrice : ""} className="h-10 min-w-0 w-1/2 border border-border px-2 text-sm"/><input name="maxPrice" type="number" min="0" placeholder="Max" defaultValue={typeof params.maxPrice === "string" ? params.maxPrice : ""} className="h-10 min-w-0 w-1/2 border border-border px-2 text-sm"/></div></fieldset>
          <div className="col-span-2 flex items-center gap-3 lg:col-span-1"><input id="filter-stock" type="checkbox" name="inStock" value="1" defaultChecked={params.inStock === "1"} className="size-4 accent-primary"/><label htmlFor="filter-stock" className="text-sm">In stock only</label></div>
          <button className="col-span-2 h-10 bg-ink px-4 text-sm font-bold text-white hover:bg-primary lg:col-span-1">Apply filters</button>
        </form>
      </aside>
      <section aria-label="Products">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted">Showing <span className="font-semibold text-ink">{start}-{end}</span> of <span className="font-semibold text-ink">{total}</span> products</p><form action={fixedCategory ? `/category/${fixedCategory}` : "/shop"} className="flex items-center gap-2"><input type="hidden" name="category" value={currentCategory ?? ""}/>{Object.entries(params).filter(([key, value]) => key !== "sort" && key !== "page" && typeof value === "string").map(([key, value]) => <input key={key} type="hidden" name={key} value={value as string}/>)}<label htmlFor="sort-products" className="text-xs text-muted">Sort by</label><select id="sort-products" name="sort" defaultValue={typeof params.sort === "string" ? params.sort : "popular"} className="h-10 border border-border bg-white px-2 text-sm"><option value="popular">Popularity</option><option value="newest">Newest</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select><button type="submit" className="h-10 border border-border px-3 text-xs font-semibold hover:border-primary">Apply</button></form></div>
        {products.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product}/>)}</div> : <div className="border border-dashed border-border px-5 py-14 text-center"><h2 className="text-lg font-bold">{catalogUnavailable ? "Catalog setup required" : total === 0 ? "No products found" : "No products match those filters"}</h2><p className="mt-2 text-sm text-muted">{catalogUnavailable ? "Configure DATABASE_URL, apply the Prisma migration, and seed the sample catalog to browse products." : "Try removing a filter or searching another term."}</p>{!catalogUnavailable && <Link href={fixedCategory ? `/category/${fixedCategory}` : "/shop"} className="mt-4 inline-block text-sm font-semibold text-primary">Clear filters</Link>}</div>}
        {pages > 1 && <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-2">{page > 1 && <Link href={`?${queryWith(params, { page: String(page - 1) })}`} className="grid size-10 place-items-center border border-border text-sm hover:border-primary">‹</Link>}{Array.from({ length: pages }, (_, index) => index + 1).slice(Math.max(0, page - 3), Math.min(pages, page + 2)).map((pageNumber) => <Link key={pageNumber} href={`?${queryWith(params, { page: String(pageNumber) })}`} aria-current={pageNumber === page ? "page" : undefined} className={`grid size-10 place-items-center border text-sm ${pageNumber === page ? "border-primary bg-primary text-white" : "border-border hover:border-primary"}`}>{pageNumber}</Link>)}{page < pages && <Link href={`?${queryWith(params, { page: String(page + 1) })}`} className="grid size-10 place-items-center border border-border text-sm hover:border-primary">›</Link>}</nav>}
      </section>
    </div>
  </div>;
}