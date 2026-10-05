"use server";

import { hash, compare } from "bcryptjs";
import { AuthTokenType } from "@prisma/client";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/auth-rate-limit";
import { createAuthToken, findAuthToken } from "@/lib/auth-tokens";
import { sendAccountEmail } from "@/lib/email";
import { registerSchema, resetPasswordSchema, profileSchema } from "@/lib/validation";

export type ActionResult = { ok: boolean; message: string; fieldErrors?: Record<string, string[]> };

function baseUrl() {
  const configured = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  if (configured) return configured.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

async function requestIp() {
  const requestHeaders = await headers();
  return requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function registerAccount(input: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };

  const ip = await requestIp();
  const [ipAllowed, emailAllowed] = await Promise.all([
    consumeRateLimit(`register-ip:${ip}`, 8, 60 * 60_000),
    consumeRateLimit(`register:${parsed.data.email}`, 4, 60 * 60_000),
  ]);
  if (!ipAllowed || !emailAllowed) return { ok: false, message: "Too many attempts. Please try again later." };

  const { firstName, lastName, email, phone, password } = parsed.data;
  const exists = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] }, select: { id: true } });
  if (exists) return { ok: false, message: "An account with those details may already exist. Try signing in or resetting your password." };

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email,
      phone,
      passwordHash: await hash(password, 12),
    },
  });

  const token = await createAuthToken(user.id, AuthTokenType.EMAIL_VERIFICATION);
  try {
    const link = `${baseUrl()}/verify-email?token=${token}`;
    await sendAccountEmail(email, "Verify your JFO Tech account", `<p>Hello,</p><p>Confirm your email to activate your JFO Tech account.</p><p><a href="${link}">Verify email address</a></p><p>This link expires in one hour.</p>`);
  } catch (error) {
    console.error("Unable to send account verification email", error instanceof Error ? error.message : "Unknown mail error");
  }

  return { ok: true, message: "Your account is ready. Check your inbox for the verification link before signing in." };
}

export async function verifyEmail(token: string): Promise<ActionResult> {
  if (!/^[a-f0-9]{64}$/i.test(token)) return { ok: false, message: "This verification link is invalid or expired." };
  const record = await findAuthToken(token, AuthTokenType.EMAIL_VERIFICATION);
  if (!record) return { ok: false, message: "This verification link is invalid or expired." };

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerified: new Date() } }),
    prisma.authToken.delete({ where: { id: record.id } }),
  ]);
  return { ok: true, message: "Email verified. You can now sign in." };
}

export async function resendVerificationEmail(emailInput: string): Promise<ActionResult> {
  const email = emailInput.trim().toLowerCase();
  if (!z.email().safeParse(email).success) return { ok: false, message: "Enter a valid email address." };

  const ip = await requestIp();
  const [ipAllowed, emailAllowed] = await Promise.all([
    consumeRateLimit(`verify-resend-ip:${ip}`, 6, 60 * 60_000),
    consumeRateLimit(`verify-resend:${email}`, 3, 60 * 60_000),
  ]);
  if (!ipAllowed || !emailAllowed) return { ok: false, message: "Too many attempts. Please try again later." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && !user.emailVerified && user.passwordHash) {
    const token = await createAuthToken(user.id, AuthTokenType.EMAIL_VERIFICATION);
    try {
      const link = `${baseUrl()}/verify-email?token=${token}`;
      await sendAccountEmail(email, "Verify your JFO Tech account", `<p>Confirm your email to activate your JFO Tech account.</p><p><a href="${link}">Verify email address</a></p><p>This link expires in one hour.</p>`);
    } catch (error) {
      console.error("Unable to resend account verification email", error instanceof Error ? error.message : "Unknown mail error");
    }
  }

  return { ok: true, message: "If the account needs verification, a new link will be sent to that email." };
}

export async function requestPasswordReset(emailInput: string): Promise<ActionResult> {
  const parsedEmail = emailInput.trim().toLowerCase();
  const emailParsed = z.email().safeParse(parsedEmail);
  if (!emailParsed.success) return { ok: false, message: "Enter a valid email address." };

  const ip = await requestIp();
  const [ipAllowed, emailAllowed] = await Promise.all([
    consumeRateLimit(`forgot-ip:${ip}`, 8, 60 * 60_000),
    consumeRateLimit(`forgot:${parsedEmail}`, 3, 60 * 60_000),
  ]);
  if (!ipAllowed || !emailAllowed) return { ok: false, message: "Too many attempts. Please try again later." };

  const user = await prisma.user.findUnique({ where: { email: parsedEmail } });
  if (user?.emailVerified && user.passwordHash) {
    const token = await createAuthToken(user.id, AuthTokenType.PASSWORD_RESET);
    try {
      const link = `${baseUrl()}/reset-password?token=${token}`;
      await sendAccountEmail(parsedEmail, "Reset your JFO Tech password", `<p>We received a request to reset your password.</p><p><a href="${link}">Choose a new password</a></p><p>This link expires in one hour. Ignore this message if you did not request a reset.</p>`);
    } catch (error) {
      console.error("Unable to send password reset email", error instanceof Error ? error.message : "Unknown mail error");
    }
  }

  return { ok: true, message: "If an eligible account exists for that email, a reset link is on its way." };
}

export async function resetPassword(input: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Use a valid link and a password of at least 10 characters.", fieldErrors: parsed.error.flatten().fieldErrors };
  const record = await findAuthToken(parsed.data.token, AuthTokenType.PASSWORD_RESET);
  if (!record || !record.user.passwordHash) return { ok: false, message: "This reset link is invalid or expired." };

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash: await hash(parsed.data.password, 12) } }),
    prisma.authToken.deleteMany({ where: { userId: record.userId, type: AuthTokenType.PASSWORD_RESET } }),
  ]);
  return { ok: true, message: "Password updated. You can sign in with your new password." };
}

export async function updateProfile(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Please sign in again." };
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };

  const { firstName, lastName, phone } = parsed.data;
  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { firstName, lastName, name: `${firstName} ${lastName}`, phone: phone || null },
    });
    return { ok: true, message: "Profile saved." };
  } catch {
    return { ok: false, message: "That phone number is already in use." };
  }
}

export async function changePassword(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Please sign in again." };

  const payload = z.object({ currentPassword: z.string().optional(), newPassword: z.string().min(10).max(72) }).safeParse(input);
  if (!payload.success) {
    return { ok: false, message: "Use a new password between 10 and 72 characters." };
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { passwordHash: true } });
  if (!user) return { ok: false, message: "Account not found." };
  if (user.passwordHash && (!payload.data.currentPassword || !(await compare(payload.data.currentPassword, user.passwordHash)))) {
    return { ok: false, message: "Current password is incorrect." };
  }

  await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash: await hash(payload.data.newPassword, 12) } });
  return { ok: true, message: user.passwordHash ? "Password changed." : "Password added to your account." };
}