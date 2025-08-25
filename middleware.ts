// middleware.ts (at repo root)
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Public vs protected routes
const PUBLIC_ROUTES = new Set<string>([
  "/",
  "/auth/login",
  "/auth/signup",
  "/auth/callback",
]);

const AUTH_ONLY = new Set<string>([
  "/dashboard",
  "/onboarding",
  "/directory",
]);

const ONBOARDING_REQUIRED = new Set<string>([
  "/dashboard",
  "/directory",
]);

const APPROVAL_REQUIRED = new Set<string>([
  "/directory",
]);

function startsWithOneOf(pathname: string, bases: Set<string>) {
  for (const b of bases) {
    if (pathname === b || pathname.startsWith(b + "/")) return true;
  }
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static/next internals quickly
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (PUBLIC_ROUTES.has(pathname)) {
    return NextResponse.next();
  }

  // Prepare a response so we can set cookies (required by @supabase/ssr on Edge)
  const res = NextResponse.next();

  // Supabase server client bound to this request/response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 1) Require auth on protected sections
  if (startsWithOneOf(pathname, AUTH_ONLY)) {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      const login = req.nextUrl.clone();
      login.pathname = "/auth/login";
      login.searchParams.set("redirect", pathname);
      return NextResponse.redirect(login);
    }

    // 2) Require onboarding before dashboard/directory
    if (startsWithOneOf(pathname, ONBOARDING_REQUIRED)) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarded, moderation_status")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.onboarded && pathname !== "/onboarding") {
        const ob = req.nextUrl.clone();
        ob.pathname = "/onboarding";
        return NextResponse.redirect(ob);
      }

      // 3) Approval gating (admin-only review; no email verification)
      if (startsWithOneOf(pathname, APPROVAL_REQUIRED)) {
        const approved = profile?.moderation_status === "approved";
        if (!approved) {
          const dash = req.nextUrl.clone();
          dash.pathname = "/dashboard"; // dashboard shows inline status banner
          return NextResponse.redirect(dash);
        }
      }
    }
  }

  return res;
}

// Run middleware everywhere except static assets
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|static|robots.txt|sitemap.xml).*)",
  ],
};
