// lib/validation/onboarding.ts
import { z } from "zod";

/**
 * Schema is render-safe:
 * - Strings default to "" (never undefined)
 * - Checkboxes default to false (no refine here)
 * Required-ness is enforced in the UI (disabled button + submit guard).
 */
export const onboardingSchema = z.object({
  full_name: z.string().default(""),

  phone: z.string().default(""),

  graduation_year: z
    .coerce
    .number()
    .int()
    .min(1900, "Invalid year")
    .max(new Date().getFullYear() + 10, "Too far in future"),

  degree: z.string().default(""),
  branch: z.string().default(""),

  company: z.string().default(""),
  job_role: z.string().default(""),
  location: z.string().default(""),

  linkedin: z.string().default(""),
  avatar_url: z.string().default(""),

  // No refine here -> avoid runtime overlay; enforce via UI
  consent_terms: z.boolean().default(false),
  consent_privacy: z.boolean().default(false),
});

export type OnboardingForm = z.infer<typeof onboardingSchema>;
