// lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * In some Next runtimes `cookies()` is async and returns a Promise.
 * Make this helper async and always await it.
 */
export async function supabaseServer() {
  // works whether cookies() is sync or async
  const cookieStore = await (cookies() as any);

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Only `get` is needed for server components (no mutation here)
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}
