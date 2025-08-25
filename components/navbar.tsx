"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
import { toast } from "sonner";

type Me = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

export default function Navbar() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = supabaseBrowser();

      // get session user
      const { data: ures } = await supabase.auth.getUser();
      const user = ures?.user;
      if (!user) {
        setMe(null);
        setLoading(false);
        return;
      }

      // fetch a tiny profile preview
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

  async function signOut() {
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    // Hard reload to clear any client state quickly
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Left: Brand + nav */}
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold">
            AlumniNet
          </Link>
          <nav className="hidden items-center gap-4 md:flex text-sm">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/directory" className="hover:underline">Directory</Link>
            {me && <Link href="/dashboard" className="hover:underline">Dashboard</Link>}
          </nav>
        </div>

        {/* Right: auth */}
        <div className="flex items-center gap-2">
          {!loading && !me && (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}

          {!loading && me && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted">
                  <Avatar className="h-7 w-7">
                    {me.avatar_url ? (
                      <AvatarImage src={me.avatar_url} alt={me.full_name ?? "Avatar"} />
                    ) : (
                      <AvatarFallback>
                        {(me.full_name ?? me.email ?? "U").slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="hidden text-sm md:block max-w-[160px] truncate">
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
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
