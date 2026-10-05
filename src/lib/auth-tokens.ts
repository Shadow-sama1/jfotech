import { createHash, randomBytes } from "node:crypto";
import { AuthTokenType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const tokenDigest = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createAuthToken(userId: string, type: AuthTokenType) {
  const token = randomBytes(32).toString("hex");
  await prisma.authToken.deleteMany({ where: { userId, type } });
  await prisma.authToken.create({
    data: {
      userId,
      type,
      tokenHash: tokenDigest(token),
      expiresAt: new Date(Date.now() + 60 * 60_000),
    },
  });
  return token;
}

export async function findAuthToken(token: string, type: AuthTokenType) {
  return prisma.authToken.findFirst({
    where: { tokenHash: tokenDigest(token), type, expiresAt: { gt: new Date() } },
    include: { user: true },
  });
}