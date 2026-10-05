import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { productCardInclude } from "@/lib/catalog";
import { buildCatalogFilter, getCatalogFilters, orderFor, PAGE_SIZE, type CatalogParams } from "@/lib/catalog-query";
import { CatalogListing } from "@/components/catalog/catalog-listing";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shop solar products", description: "Browse solar panels, inverters, batteries, controllers, accessories, and complete systems." };

export default async function ShopPage({ searchParams }: { searchParams: Promise<CatalogParams> }) {
  const params = await searchParams;
  if (!process.env.DATABASE_URL) {
    return <CatalogListing title="Shop solar products" intro="Browse dependable solar equipment selected for Nigerian homes and businesses." products={[]} total={0} page={1} params={params} filters={{ categories: [], brands: [], capacities: [] }} catalogUnavailable />;
  }
  const { where, page, sort } = buildCatalogFilter(params);
  const [products, total, filters] = await Promise.all([
    prisma.product.findMany({ where, include: productCardInclude, orderBy: orderFor(sort), skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.product.count({ where }),
    getCatalogFilters(),
  ]);

  return <CatalogListing title="Shop solar products" intro="Explore dependable solar equipment selected for Nigerian homes and businesses." products={products} total={total} page={page} params={params} filters={filters} />;
}