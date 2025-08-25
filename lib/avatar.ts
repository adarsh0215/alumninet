// lib/avatar.ts

/**
 * Get a safe avatar URL for Next.js <Image />.
 * Handles:
 * - null/empty values (fallback placeholder)
 * - Supabase storage paths (turn into full URL)
 * - Already-valid full URLs (return as-is)
 */
export function getAvatarUrl(avatarPath?: string | null): string {
  if (!avatarPath) {
    // Fallback placeholder image (you can change this)
    return "/default-avatar.png";
  }

  // If the string already looks like a URL, return as-is
  if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
    return avatarPath;
  }

  // Otherwise assume it's a Supabase storage key
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${projectUrl}/storage/v1/object/public/avatars/${avatarPath}`;
}
