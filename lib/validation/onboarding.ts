// lib/validation/onboarding.ts
import { z } from "zod";

const CURRENT_YEAR = new Date().getFullYear();

export const onboardingSchema = z.object({
  // Basics
  full_name: z.string().trim().min(2, "Full name is required"),
  phone: z.string().trim().optional().default(""),

  // Order: degree → branch → graduation_year
  degree: z.string().trim().min(1, "Degree is required"),
  branch: z.string().trim().min(1, "Branch is required"),
  graduation_year: z
    .coerce.number() // accepts "2024" string from input
    .int()
    .min(1900, "Invalid year")
    .max(CURRENT_YEAR + 10, "Too far in future"),

  // Work / location
  company: z.string().trim().optional().default(""),
  job_role: z.string().trim().optional().default(""),
  location: z.string().trim().optional().default(""),

  // Links (allow empty or valid URL)
  linkedin: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((v) => !v || /^https?:\/\/.+/i.test(v), { message: "Must be a valid URL" }),
  avatar_url: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((v) => !v || /^https?:\/\/.+/i.test(v), { message: "Must be a valid URL" }),

  // Consents (boolean + refine to avoid z.literal overload issues)
  consent_terms: z
    .boolean()
    .refine((v) => v === true, { message: "You must accept the Terms & Conditions" }),
  consent_privacy: z
    .boolean()
    .refine((v) => v === true, { message: "You must accept the Privacy Policy" }),
});

export type OnboardingForm = z.infer<typeof onboardingSchema>;
