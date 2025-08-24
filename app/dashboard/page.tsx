// app/dashboard/page.tsx
import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await supabaseServer();

  // 1) Require auth
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    redirect("/auth/login");
  }

  // 2) Require onboarding
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, graduation_year, degree, branch, company, job_role, location, linkedin, avatar_url, onboarded"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (profileErr) {
    // If table not ready or other issue, push back to onboarding to keep flow safe
    redirect("/onboarding");
  }

  if (!profile || !profile.onboarded) {
    redirect("/onboarding");
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Welcome, {profile.full_name || "Alumnus"} 👋</h1>
      <div className="mt-6 grid gap-4">
        <div className="rounded-2xl border p-4">
          <div className="font-medium">Your Profile</div>
          <div className="mt-2 text-sm text-muted-foreground">
            <div>Email: {profile.email ?? "—"}</div>
            <div>Degree / Branch: {profile.degree ?? "—"} / {profile.branch ?? "—"}</div>
            <div>Graduation Year: {profile.graduation_year ?? "—"}</div>
            <div>Company / Role: {profile.company ?? "—"} / {profile.job_role ?? "—"}</div>
            <div>Location: {profile.location ?? "—"}</div>
            <div>LinkedIn: {profile.linkedin ?? "—"}</div>
          </div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="font-medium mb-2">Next steps</div>
          <ul className="list-disc ml-5 text-sm text-muted-foreground">
            <li>Explore the <a className="underline" href="/directory">Alumni Directory</a></li>
            <li>Update your profile anytime from the onboarding page</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
