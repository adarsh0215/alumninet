// app/dashboard/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import ApprovalBanner from "@/components/dashboard/approval-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Moderation = "pending" | "approved" | "rejected";

type ProfileRow = {
  email: string | null;
  full_name: string | null;
  phone: string | null;

  degree: string | null;
  branch: string | null;
  graduation_year: number | null;

  company: string | null;
  job_role: string | null;
  location: string | null;

  linkedin: string | null;
  avatar_url: string | null;

  onboarded: boolean | null;
  moderation_status: Moderation | null;
  moderation_reason: string | null;
};

export default async function DashboardPage() {
  const supabase = await supabaseServer();

  // Auth (middleware should enforce, but we fail-safe here)
  const userRes = await supabase.auth.getUser();
  const user = userRes.data.user;
  if (!user) redirect("/auth/login?redirect=/dashboard");

  // Load profile (explicit typing so TS is happy)
  const profRes = await supabase
    .from("profiles")
    .select(
      [
        "email",
        "full_name",
        "phone",
        "degree",
        "branch",
        "graduation_year",
        "company",
        "job_role",
        "location",
        "linkedin",
        "avatar_url",
        "onboarded",
        "moderation_status",
        "moderation_reason",
      ].join(",")
    )
    .eq("id", user.id)
    .maybeSingle();

  // Cast data to our typed row (Supabase types can be loose here)
  const profile = (profRes.data ?? null) as ProfileRow | null;

  // If profile is missing (shouldn’t happen after onboarding), nudge back
  if (!profile) {
    redirect("/onboarding");
  }

  const name =
    profile.full_name?.trim() || user.email?.split("@")[0] || "there";
  const moderationStatus: Moderation =
    profile.moderation_status ?? "pending";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Greeting */}
      <h1 className="text-2xl md:text-3xl font-semibold">Welcome, {name} 👋</h1>

      {/* Inline approval banner (hidden when approved) */}
      <ApprovalBanner
        moderationStatus={moderationStatus}
        moderationReason={profile.moderation_reason}
      />

      {/* Profile Summary */}
      <Card>
        <CardHeader className="flex items-center justify-between gap-2 flex-row">
          <CardTitle>Your Profile</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/onboarding">Edit</Link>
          </Button>
        </CardHeader>

        <CardContent className="grid gap-3 md:grid-cols-2">
          <ProfileRowView label="Email" value={profile.email || user.email || "—"} />
          <ProfileRowView label="Full Name" value={profile.full_name || "—"} />
          <ProfileRowView label="Phone" value={profile.phone || "—"} />

          <ProfileRowView label="Degree" value={profile.degree || "—"} />
          <ProfileRowView label="Branch" value={profile.branch || "—"} />
          <ProfileRowView
            label="Graduation Year"
            value={profile.graduation_year != null ? String(profile.graduation_year) : "—"}
          />

          <ProfileRowView label="Company" value={profile.company || "—"} />
          <ProfileRowView label="Job Role" value={profile.job_role || "—"} />
          <ProfileRowView label="Location" value={profile.location || "—"} />

          <ProfileRowView
            label="LinkedIn"
            value={
              profile.linkedin ? (
                <a
                  href={profile.linkedin}
                  className="text-primary underline underline-offset-4"
                  target="_blank"
                  rel="noreferrer"
                >
                  {profile.linkedin}
                </a>
              ) : (
                "—"
              )
            }
          />
          <ProfileRowView
            label="Approval"
            value={
              moderationStatus === "approved"
                ? "Approved ✅"
                : moderationStatus === "rejected"
                ? "Rejected ❌"
                : "Pending ⏳"
            }
          />
        </CardContent>
      </Card>

      {/* CTA: Directory access only when approved */}
      <div className="flex items-center gap-3">
        <Button asChild disabled={moderationStatus !== "approved"}>
          <Link href="/directory">Go to Directory</Link>
        </Button>
        {moderationStatus !== "approved" && (
          <span className="text-sm text-muted-foreground">
            You’ll be able to access the directory once approved.
          </span>
        )}
      </div>
    </div>
  );
}

function ProfileRowView({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm">{value}</span>
    </div>
  );
}
