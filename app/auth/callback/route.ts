// app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Handles Supabase OAuth redirect.
 * - Exchanges ?code= for a session
 * - Redirects new users to /onboarding (no profiles row yet)
 * - Redirects existing users to /dashboard
 * - On error, returns to /auth/login with error description
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const errorDescription =
    url.searchParams.get("error_description") || "OAuth failed";

  // If provider sent back an error, go back to login
  if (error) {
    const redirect = new URL("/auth/login", req.url);
    redirect.searchParams.set("error", errorDescription);
    return NextResponse.redirect(redirect);
  }

  if (!code) {
    const redirect = new URL("/auth/login", req.url);
    redirect.searchParams.set("error", "Missing OAuth code");
    return NextResponse.redirect(redirect);
  }

  try {
    const supabase = await supabaseServer();

    // 1) Exchange code for a session (sets cookies via our server client)
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      code
    );
    if (exchangeError) {
      const redirect = new URL("/auth/login", req.url);
      redirect.searchParams.set("error", exchangeError.message);
      return NextResponse.redirect(redirect);
    }

    // 2) Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      const redirect = new URL("/auth/login", req.url);
      redirect.searchParams.set(
        "error",
        userError?.message || "No authenticated user"
      );
      return NextResponse.redirect(redirect);
    }

    // 3) Check if a profile row exists (we'll create schema next)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    // If the profiles table isn't ready yet, treat as "no profile" to move user into onboarding.
    if (profileError) {
      // Optionally log profileError to an observability tool here
    }

    // 4) Redirect based on whether a profile exists
    const destination = profile ? "/dashboard" : "/onboarding";
    return NextResponse.redirect(new URL(destination, req.url));
  } catch (e) {
    const redirect = new URL("/auth/login", req.url);
    redirect.searchParams.set(
      "error",
      e instanceof Error ? e.message : "Unexpected error"
    );
    return NextResponse.redirect(redirect);
  }
}
