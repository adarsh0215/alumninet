// components/dashboard/approval-banner.tsx
"use client";

import { Info } from "lucide-react"; // simple icon, small footprint
import { cn } from "@/lib/utils";

type Moderation = "pending" | "approved" | "rejected";

export default function ApprovalBanner({
  moderationStatus,
  moderationReason,
  className,
}: {
  moderationStatus: Moderation;
  moderationReason?: string | null;
  className?: string;
}) {
  if (moderationStatus === "approved") return null;

  const isRejected = moderationStatus === "rejected";

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-md border px-4 py-3",
        isRejected
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-yellow-300/40 bg-yellow-100/50 text-yellow-900",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="text-sm">
        {isRejected ? (
          <>
            <strong>Application Rejected.</strong>{" "}
            {moderationReason ? (
              <span>Reason: {moderationReason}</span>
            ) : (
              <span>Please update your profile and resubmit.</span>
            )}
          </>
        ) : (
          <>
            <strong>Waiting for approval.</strong>{" "}
            You’ll get access to the directory once an admin approves your
            profile.
          </>
        )}
      </div>
    </div>
  );
}
