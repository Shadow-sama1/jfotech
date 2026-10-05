import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { productCardInclude } from "@/lib/catalog";
import { buildCatalogFilter, getCatalogFilters, orderFor, PAGE_SIZE, type CatalogParams } from "@/lib/catalog-query";
import { CatalogListing } from "@/components/catalog/catalog-listing";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!process.env.DATABASE_URL) return { title: slug.replaceAll("-", " ") };
  const category = await prisma.category.findUnique({ where: { slug }, select: { name: true, description: true } });
  return category ? { title: category.name, description: category.description ?? `Shop ${category.name.toLowerCase()} at JFO Tech.` } : { title: "Category not found" };
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<CatalogParams> }) {
  const [{ slug }, paramsValue] = await Promise.all([params, searchParams]);
  if (!process.env.DATABASE_URL) {
    return <CatalogListing title={slug.replaceAll("-", " ")} products={[]} total={0} page={1} params={paramsValue} filters={{ categories: [], brands: [], capacities: [] }} fixedCategory={slug} catalogUnavailable />;
  }
  const category = await prisma.category.findUnique({ where: { slug, isActive: true } });
  if (!category) notFound();

  const { where, page, sort } = buildCatalogFilter(paramsValue, slug);
  const [products, total, filters] = await Promise.all([
    prisma.product.findMany({ where, include: productCardInclude, orderBy: orderFor(sort), skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.product.count({ where }),
    getCatalogFilters(),
  ]);
  return <CatalogListing title={category.name} intro={category.description} products={products} total={total} page={page} params={paramsValue} filters={filters} fixedCategory={slug} />;
}