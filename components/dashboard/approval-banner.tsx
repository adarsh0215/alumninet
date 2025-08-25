"use client";

import Link from "next/link";
import { AlertCircle, Hourglass, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Props {
  moderationStatus: "pending" | "approved" | "rejected";
  moderationReason?: string | null;
}

/**
 * Inline dashboard banner:
 * - hidden if approved
 * - shows info if pending/rejected
 */
export default function ApprovalBanner({ moderationStatus, moderationReason }: Props) {
  if (moderationStatus === "approved") return null;

  if (moderationStatus === "pending") {
    return (
      <Alert>
        <Hourglass className="h-4 w-4" />
        <AlertTitle>Waiting for Approval</AlertTitle>
        <AlertDescription>
          Your profile is under review by admins. Once approved, you’ll unlock
          full access to the alumni directory.
        </AlertDescription>
      </Alert>
    );
  }

  if (moderationStatus === "rejected") {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Profile Rejected</AlertTitle>
        <AlertDescription>
          Unfortunately your profile was rejected.
          {moderationReason && (
            <div className="mt-1">Reason: {moderationReason}</div>
          )}
          <div className="mt-2">
            <Link href="/onboarding" className="underline">
              Update your profile
            </Link>{" "}
            and resubmit.
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Fallback: show nothing
  return null;
}
