// components/navbar.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import UserPill from "@/components/user-pill";

export default async function Navbar() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let fullName: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();
    fullName = profile?.full_name ?? null;
  }

  // Server Action for sign-out
  async function signOut(_: FormData) {
    "use server";
    const sb = await supabaseServer();
    await sb.auth.signOut();
    redirect("/");
  }

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Left: brand + primary nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold">
            AlumniNet
          </Link>
          <nav className="hidden gap-4 sm:flex">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Home
            </Link>
            <Link
              href="/directory"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Directory
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        {/* Right: auth controls */}
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          ) : (
            <UserPill
              name={fullName ?? undefined}
              email={user.email ?? undefined}
              signOutAction={signOut}
            />
          )}
        </div>
      </div>
    </header>
  );
}
