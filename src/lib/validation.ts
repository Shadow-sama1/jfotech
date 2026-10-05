import { z } from "zod";

const phoneSchema = z.string().trim().regex(/^\+?[0-9][0-9\s()-]{7,17}$/, "Enter a valid phone number.");

export const loginSchema = z.object({
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  password: z.string().min(1, "Enter your password."),
});

export const registerSchema = z.object({
  firstName: z.string().trim().min(2, "Enter at least 2 characters.").max(60),
  lastName: z.string().trim().min(2, "Enter at least 2 characters.").max(60),
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  phone: phoneSchema,
  password: z.string().min(10, "Use at least 10 characters.").max(72, "Use 72 characters or fewer."),
});

export const resetPasswordSchema = z.object({
  token: z.string().length(64),
  password: z.string().min(10, "Use at least 10 characters.").max(72, "Use 72 characters or fewer."),
});

export const profileSchema = z.object({
  firstName: z.string().trim().min(2).max(60),
  lastName: z.string().trim().min(2).max(60),
  phone: z.union([phoneSchema, z.literal("")]),
});

export const addressSchema = z.object({
  label: z.enum(["HOME", "WORK", "OTHER"]),
  fullName: z.string().trim().min(2).max(100),
  phone: phoneSchema,
  street: z.string().trim().min(4).max(160),
  street2: z.string().trim().max(160),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(60),
  lga: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().max(12),
  isDefault: z.boolean(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AddressInput = z.infer<typeof addressSchema>;