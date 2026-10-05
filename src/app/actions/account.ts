"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { addressSchema } from "@/lib/validation";
import { isValidNigerianLocation } from "@/lib/nigeria";
import type { ActionResult } from "@/app/actions/auth";

export async function saveAddress(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Please sign in again." };
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  if (!isValidNigerianLocation(parsed.data.state, parsed.data.lga)) return { ok: false, message: "Select a valid Nigerian state and LGA." };

  await prisma.$transaction(async (transaction) => {
    const existingCount = await transaction.address.count({ where: { userId: session.user.id } });
    const isDefault = parsed.data.isDefault || existingCount === 0;
    if (isDefault) await transaction.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } });
    await transaction.address.create({
      data: {
        ...parsed.data,
        street2: parsed.data.street2 || null,
        postalCode: parsed.data.postalCode || null,
        isDefault,
        userId: session.user.id,
      },
    });
  });
  return { ok: true, message: "Address saved." };
}

export async function setDefaultAddress(addressId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Please sign in again." };
  const owned = await prisma.address.findFirst({ where: { id: addressId, userId: session.user.id }, select: { id: true } });
  if (!owned) return { ok: false, message: "Address not found." };

  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } }),
    prisma.address.update({ where: { id: owned.id }, data: { isDefault: true } }),
  ]);
  return { ok: true, message: "Default address updated." };
}

export async function deleteAddress(addressId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Please sign in again." };
  const result = await prisma.address.deleteMany({ where: { id: addressId, userId: session.user.id } });
  if (!result.count) return { ok: false, message: "Address not found." };

  const hasDefault = await prisma.address.findFirst({ where: { userId: session.user.id, isDefault: true }, select: { id: true } });
  if (!hasDefault) {
    const nextAddress = await prisma.address.findFirst({ where: { userId: session.user.id }, orderBy: { createdAt: "asc" }, select: { id: true } });
    if (nextAddress) await prisma.address.update({ where: { id: nextAddress.id }, data: { isDefault: true } });
  }
  return { ok: true, message: "Address removed." };
}

export async function toggleWishlist(productId: string): Promise<ActionResult & { saved?: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Sign in to save wishlist items." };
  const product = await prisma.product.findFirst({ where: { id: productId, isPublished: true }, select: { id: true } });
  if (!product) return { ok: false, message: "Product not found." };

  const existing = await prisma.wishlistItem.findUnique({ where: { userId_productId: { userId: session.user.id, productId } } });
  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return { ok: true, message: "Removed from wishlist.", saved: false };
  }
  await prisma.wishlistItem.create({ data: { userId: session.user.id, productId } });
  return { ok: true, message: "Added to wishlist.", saved: true };
}