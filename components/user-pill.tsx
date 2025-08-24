// components/user-pill.tsx
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  name?: string;
  email?: string;
  // Server Action injected from Navbar (server component)
  signOutAction: (formData: FormData) => Promise<void>;
};

export default function UserPill({ name, email, signOutAction }: Props) {
  const initials = useMemo(() => {
    const source = (name || email || "").trim();
    if (!source) return "U";
    const parts = source.split(/\s+/);
    const chars =
      parts.length >= 2
        ? (parts[0][0] + parts[1][0])
        : source.slice(0, 2);
    return chars.toUpperCase();
  }, [name, email]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 px-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {initials}
          </span>
          <span className="hidden text-sm sm:inline-block">
            {name || email || "User"}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">
          {name || "User"}
          <div className="text-xs font-normal text-muted-foreground truncate">
            {email}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/onboarding">Edit Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* Sign out via server action */}
        <form action={signOutAction}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full text-left">
              Sign out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
