// lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Server-side Supabase client (RSC, server actions, route handlers).
 * NOTE: In Next 15, cookies() is async, so this factory is async too.
 * Always: const supabase = await supabaseServer();
 */
export const supabaseServer = async () => {
  const cookieStore = await cookies();

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Ensure Supabase can set/refresh auth cookies during SSR flows
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          // "Remove" by setting an expired cookie (Next’s recommended approach)
          cookieStore.set({
            name,
            value: "",
            ...options,
            expires: new Date(0),
          });
        },
      },
    }
  );

  return client;
};
