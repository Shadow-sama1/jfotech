import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

export async function consumeRateLimit(key: string, limit: number, windowMs: number) {
  const storageKey = createHash("sha256").update(key).digest("hex");
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  await prisma.authRateLimit.upsert({
    where: { key: storageKey },
    create: { key: storageKey, count: 0, resetAt },
    update: {},
  });

  return prisma.$transaction(async (transaction) => {
    await transaction.authRateLimit.updateMany({
      where: { key: storageKey, resetAt: { lte: now } },
      data: { count: 0, resetAt },
    });

    const updated = await transaction.authRateLimit.updateMany({
      where: { key: storageKey, resetAt: { gt: now }, count: { lt: limit } },
      data: { count: { increment: 1 } },
    });

    return updated.count === 1;
  });
}