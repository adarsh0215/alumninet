// components/user-pill.tsx
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { cn } from "@/lib/utils"; // if you have a className helper; otherwise remove and inline
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck, Clock, XCircle } from "lucide-react";

type Moderation = "approved" | "pending" | "rejected";

type Props = {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  moderationStatus?: Moderation; // optional: shows a tiny badge next to name
  className?: string;
  // Server Action injected from a server component (Navbar)
  signOutAction: (formData: FormData) => Promise<void>;
  loading?: boolean; // optional skeleton state
};

export default function UserPill({
  name,
  email,
  avatarUrl,
  moderationStatus,
  className,
  signOutAction,
  loading = false,
}: Props) {
  const displayName = name?.trim() || email?.trim() || "User";

  const initials = useMemo(() => {
    const src = (name || email || "U").trim();
    if (!src) return "U";
    const parts = src.split(/\s+/).filter(Boolean);
    const chars =
      parts.length >= 2 ? parts[0][0] + parts[1][0] : src.slice(0, 2);
    return chars.toUpperCase();
  }, [name, email]);

  // Small status icon + label
  const status = moderationStatus ?? null;
  const StatusIcon =
    status === "approved"
      ? BadgeCheck
      : status === "rejected"
      ? XCircle
      : status === "pending"
      ? Clock
      : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-9 gap-2 px-2 rounded-md hover:bg-muted aria-expanded:bg-muted",
            className
          )}
          aria-label="Open user menu"
        >
          {/* Avatar / Initials */}
          <Avatar className="h-7 w-7">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={displayName} />
            ) : (
              <AvatarFallback>{initials}</AvatarFallback>
            )}
          </Avatar>

          {/* Name (truncate on small screens) */}
          <span className="hidden max-w-[160px] truncate text-sm sm:inline-block">
            {displayName}
          </span>

          {/* Optional tiny status pill (desktop) */}
          {StatusIcon && (
            <span
              className={cn(
                "hidden items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] sm:inline-flex",
                status === "approved" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
                status === "pending" && "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
                status === "rejected" && "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
              )}
              aria-label={`Status: ${status}`}
              title={`Status: ${status}`}
            >
              <StatusIcon className="h-3 w-3" />
              {status === "approved" ? "Approved" : status === "pending" ? "Pending" : "Rejected"}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        {/* Header: name + email (truncate) */}
        <DropdownMenuLabel className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={displayName} />
              ) : (
                <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
              )}
            </Avatar>
            <span className="truncate">{displayName}</span>
          </div>

          {email && (
            <div className="truncate text-xs font-normal text-muted-foreground">
              {email}
            </div>
          )}

          {/* Inline status hint (mobile-visible too) */}
          {StatusIcon && (
            <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-foreground/80">
              <StatusIcon className="h-3 w-3" />
              {status === "approved" ? "Approved" : status === "pending" ? "Pending review" : "Rejected"}
            </div>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Nav actions */}
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
            <button
              type="submit"
              className="w-full text-left text-red-600 focus:text-red-700 dark:text-red-500 dark:focus:text-red-400"
              aria-label="Sign out"
            >
              Sign out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
