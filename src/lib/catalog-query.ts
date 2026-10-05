import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const PAGE_SIZE = 12;

export type CatalogParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
const safeNumber = (value: string | undefined) => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

export function buildCatalogFilter(params: CatalogParams, forcedCategory?: string): { where: Prisma.ProductWhereInput; page: number; sort: string } {
  const category = forcedCategory ?? first(params.category);
  const minimum = safeNumber(first(params.minPrice));
  const maximum = safeNumber(first(params.maxPrice));
  const power = safeNumber(first(params.power));
  const search = first(params.q)?.trim().slice(0, 120);
  const brand = first(params.brand)?.trim().slice(0, 80);
  const capacity = first(params.capacity)?.trim().slice(0, 40);
  const pageValue = safeNumber(first(params.page));
  const stockOnly = first(params.inStock) === "1";

  return {
    where: {
      isPublished: true,
      ...(category ? { category: { slug: category } } : {}),
      ...(brand ? { brand: { equals: brand, mode: "insensitive" } } : {}),
      ...(capacity ? { capacity: { contains: capacity, mode: "insensitive" } } : {}),
      ...(power ? { powerRating: { gte: power } } : {}),
      ...(stockOnly ? { stock: { gt: 0 } } : {}),
      ...(minimum !== undefined || maximum !== undefined ? { price: { ...(minimum !== undefined ? { gte: minimum } : {}), ...(maximum !== undefined ? { lte: maximum } : {}) } } : {}),
      ...(search ? { OR: [
        { name: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
      ] } : {}),
    },
    page: Math.max(1, Math.floor(pageValue ?? 1)),
    sort: first(params.sort) ?? "popular",
  };
}

export function orderFor(sort: string): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc": return [{ price: "asc" }, { name: "asc" }];
    case "price-desc": return [{ price: "desc" }, { name: "asc" }];
    case "newest": return [{ createdAt: "desc" }];
    case "popular": return [{ popularity: "desc" }, { createdAt: "desc" }];
    default: return [{ popularity: "desc" }, { createdAt: "desc" }];
  }
}

export async function getCatalogFilters() {
  const [categories, brands, capacities] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { name: true, slug: true } }),
    prisma.product.findMany({ where: { isPublished: true }, distinct: ["brand"], orderBy: { brand: "asc" }, select: { brand: true } }),
    prisma.product.findMany({ where: { isPublished: true, capacity: { not: null } }, distinct: ["capacity"], orderBy: { capacity: "asc" }, select: { capacity: true } }),
  ]);
  return { categories, brands: brands.map(({ brand }) => brand), capacities: capacities.map(({ capacity }) => capacity!).filter(Boolean) };
}