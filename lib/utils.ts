// lib/utils.ts
import { type ClassValue } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes safely. Use in shadcn/ui components:
 *   className={cn("p-2", condition && "opacity-50")}
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
