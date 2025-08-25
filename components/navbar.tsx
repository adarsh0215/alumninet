"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { supabaseBrowser } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { Menu, X, Sun, Moon, GraduationCap } from "lucide-react";

type Me = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

type Theme = "light" | "dark";

export default function Navbar() {
  const pathname = usePathname();

  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false); // mobile menu
  const [theme, setTheme] = useState<Theme>("light");

  // ----- Auth bootstrap -----
  useEffect(() => {
    (async () => {
      const supabase = supabaseBrowser();
      const { data: ures } = await supabase.auth.getUser();
      const user = ures?.user;

      if (!user) {
        setMe(null);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      setMe({
        id: user.id,
        email: user.email ?? null,
        full_name: profile?.full_name ?? null,
        avatar_url: profile?.avatar_url ?? null,
      });
      setLoading(false);
    })();
  }, []);

  // ----- Theme bootstrap (no extra deps) -----
  useEffect(() => {
    // prefer saved; else follow OS
    const saved = (localStorage.getItem("theme") as Theme | null) ?? null;
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches;

    const initial: Theme = saved ?? (prefersDark ? "dark" : "light");
    applyTheme(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyTheme(next: Theme) {
    setTheme(next);
    const root = document.documentElement;
    if (next === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", next);
  }

  function toggleTheme() {
    applyTheme(theme === "dark" ? "light" : "dark");
  }

  async function signOut() {
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    window.location.href = "/"; // hard refresh to clear state
  }

  // small logo mark
  const Logo = (
    <span className="flex items-center gap-2">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <GraduationCap className="h-5 w-5" aria-hidden />
      </span>
      <span className="text-base font-semibold tracking-tight">NITDIAN</span>
    </span>
  );

  const isActive = useMemo(
    () => (href: string) =>
      href === "/"
        ? pathname === "/"
        : pathname === href || pathname.startsWith(`${href}/`),
    [pathname]
  );

  const linkCls = (href: string) =>
    [
      "rounded-md px-2 py-1 text-sm transition-colors",
      isActive(href) ? "bg-muted text-foreground" : "hover:bg-muted",
    ].join(" ");

  const NavLinks = (
    <>
      <Link href="/" className={linkCls("/")}>
        Home
      </Link>
      <Link href="/directory" className={linkCls("/directory")}>
        Directory
      </Link>
      {me && (
        <Link href="/dashboard" className={linkCls("/dashboard")}>
          Dashboard
        </Link>
      )}
    </>
  );

  const AuthButtons = (
    <>
      <Link href="/auth/login">
        <Button variant="ghost" size="sm" className="w-full sm:w-auto">
          Login
        </Button>
      </Link>
      <Link href="/auth/signup">
        <Button size="sm" className="w-full sm:w-auto">
          Sign Up
        </Button>
      </Link>
    </>
  );

  const initials = (me?.full_name || me?.email || "U")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-3 md:px-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            aria-label="NITDIAN home"
            className="flex items-center gap-2"
          >
            {Logo}
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 md:flex">{NavLinks}</nav>

        {/* Right controls */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            className="h-9 w-9"
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Auth area (desktop) */}
          <div className="hidden gap-2 md:flex">
            {!loading && !me && AuthButtons}

            {!loading && me && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-muted"
                    aria-label="Open user menu"
                  >
                    <Avatar className="h-8 w-8">
                      {me.avatar_url ? (
                        <AvatarImage
                          src={me.avatar_url}
                          alt={me.full_name ?? "Avatar"}
                        />
                      ) : (
                        <AvatarFallback>{initials}</AvatarFallback>
                      )}
                    </Avatar>
                    <span className="hidden max-w-[160px] truncate text-sm md:block">
                      {me.full_name ?? me.email ?? "User"}
                    </span>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">
                    {me.full_name ?? me.email ?? "User"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/onboarding">Edit profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={signOut}
                    className="text-destructive"
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Skeleton to avoid layout shift while loading */}
            {loading && (
              <div className="h-8 w-[160px] animate-pulse rounded-md bg-muted" />
            )}
          </div>

          {/* Mobile: menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="ml-1 h-9 w-9 md:hidden"
            aria-label="Toggle navigation"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t bg-background/95 md:hidden">
          <div className="container mx-auto flex flex-col gap-2 px-3 py-3">
            <div
              className="flex flex-col"
              onClick={() => setOpen(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setOpen(false);
              }}
              role="navigation"
              aria-label="Mobile navigation"
              tabIndex={0}
            >
              {NavLinks}
            </div>

            <div className="mt-2 flex items-center gap-2">
              {!loading && !me && AuthButtons}
              {!loading && me && (
                <>
                  <Link
                    href="/dashboard"
                    className={linkCls("/dashboard")}
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/onboarding"
                    className={linkCls("/onboarding")}
                    onClick={() => setOpen(false)}
                  >
                    Edit profile
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="ml-auto"
                    onClick={signOut}
                  >
                    Sign out
                  </Button>
                </>
              )}
              {loading && <div className="h-8 w-full animate-pulse rounded-md bg-muted" />}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
