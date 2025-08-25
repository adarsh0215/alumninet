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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/dashboard");

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

  const profile = (profRes.data ?? null) as ProfileRow | null;
  if (!profile) redirect("/onboarding");

  const name = profile.full_name?.trim() || user.email?.split("@")[0] || "there";
  const moderationStatus: Moderation = profile.moderation_status ?? "pending";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <h1 className="text-2xl md:text-3xl font-semibold">Welcome, {name} 👋</h1>

      <ApprovalBanner
        moderationStatus={moderationStatus}
        moderationReason={profile.moderation_reason}
      />

      <Card>
        <CardHeader className="flex items-center justify-between gap-2 flex-row">
          <CardTitle>Your Profile</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/onboarding">Edit</Link>
          </Button>
        </CardHeader>

        <CardContent className="grid gap-3 md:grid-cols-2">
          <Row label="Email" value={profile.email || user.email || "—"} />
          <Row label="Full Name" value={profile.full_name || "—"} />
          <Row label="Phone" value={profile.phone || "—"} />

          <Row label="Degree" value={profile.degree || "—"} />
          <Row label="Branch" value={profile.branch || "—"} />
          <Row
            label="Graduation Year"
            value={profile.graduation_year != null ? String(profile.graduation_year) : "—"}
          />

          <Row label="Company" value={profile.company || "—"} />
          <Row label="Job Role" value={profile.job_role || "—"} />
          <Row label="Location" value={profile.location || "—"} />

          <Row
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
          <Row
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

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}
