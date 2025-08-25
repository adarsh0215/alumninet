"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  onboardingSchema,
  type OnboardingForm,
} from "@/lib/validation/onboarding";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Little helper to render a required asterisk consistently */
function Required({ children }: { children: string }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      {children}
      <span className="ml-0.5 text-destructive" aria-hidden="true">
        *
      </span>
      <span className="sr-only">required</span>
    </span>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  // Auth email pill
  const [email, setEmail] = useState<string>("");

  // Avatar – local state for preview + file + light progress
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);

  // Prefill email (read-only)
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error) setEmail(data.user?.email ?? "");
    })();
  }, [supabase]);

  // Manage preview URL lifecycle for local file
  useEffect(() => {
    if (!avatarFile) {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]); // eslint-disable-line react-hooks/exhaustive-deps

  const resolver = zodResolver(onboardingSchema) as unknown as Resolver<OnboardingForm>;
  const form = useForm<OnboardingForm>({
    resolver,
    defaultValues: {
      full_name: "",
      phone: "",
      degree: "",
      branch: "",
      graduation_year: new Date().getFullYear(),
      company: "",
      job_role: "",
      location: "",
      linkedin: "",
      avatar_url: "",
      consent_terms: false,
      consent_privacy: false,
    },
    mode: "onSubmit",
    reValidateMode: "onBlur",
  });

  // Options (kept stable)
  const degreeOptions = useMemo(
    () => ["B.Tech", "B.E.", "M.Tech", "M.E.", "B.Sc", "M.Sc", "MBA", "Ph.D"],
    []
  );
  const branchOptions = useMemo(
    () => ["CSE", "ECE", "EEE", "IT", "Mechanical", "Civil", "Chemical", "AI/ML", "Data Science", "Other"],
    []
  );

  /** Upload avatar file to Supabase Storage → return public URL */
  async function uploadAvatarOrReturnUrl(
    file: File | null,
    userId: string
  ): Promise<string | null> {
    if (!file) return null;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return null;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large (max 5MB).");
      return null;
    }

    try {
      setIsUploading(true);
      setUploadPct(10);

      const path = `profiles/${userId}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase
        .storage
        .from("avatars")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) throw error;
      setUploadPct(60);

      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(data.path);
      setUploadPct(100);
      return pub.publicUrl;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload avatar";
      toast.error(msg);
      return null;
    } finally {
      setTimeout(() => setUploadPct(0), 600);
      setIsUploading(false);
    }
  }

  const onSubmit: SubmitHandler<OnboardingForm> = async (values) => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      toast.error("You must be logged in to complete onboarding");
      return;
    }

    // Upload avatar if provided
    if (avatarFile) {
      const publicUrl = await uploadAvatarOrReturnUrl(avatarFile, user.id);
      if (publicUrl) values.avatar_url = publicUrl;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email ?? null,
      ...values,
      full_name: values.full_name.trim(),
      degree: values.degree.trim(),
      branch: values.branch.trim(),
      onboarded: true,
      moderation_status: "pending",
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Onboarding complete! Your profile is pending approval.");
    router.push("/dashboard");
  };

  // Live gating for submit button
  const w = form.watch();
  const requiredIncomplete =
    !w.full_name?.trim() ||
    !w.degree?.trim() ||
    !w.branch?.trim() ||
    !Number.isFinite(Number(w.graduation_year)) ||
    !w.consent_terms ||
    !w.consent_privacy;

  const isSaving = form.formState.isSubmitting;
  const disabled = requiredIncomplete || isSaving || isUploading;

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    form.setValue("avatar_url", ""); // ensure we don’t keep a stale URL
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold">Onboarding</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tell us a bit about you. It’ll help alumni find and connect with you.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg md:text-xl">Your details</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Email pill */}
          <div className="mb-6 rounded-md border bg-muted/30 px-3 py-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">Signed in as</span>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs">{email || "—"}</span>
              <span className="text-muted-foreground">Email is read-only</span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              {/* Grid layout: stacks on mobile, 2-col on md+ */}
              <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Required>Full Name</Required>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your full name"
                          autoComplete="name"
                          aria-required="true"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+91..."
                          inputMode="tel"
                          autoComplete="tel"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Degree */}
                <FormField
                  control={form.control}
                  name="degree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Required>Degree</Required>
                      </FormLabel>
                      <Select
                        value={field.value || "any"}
                        onValueChange={(val) => field.onChange(val === "any" ? "" : val)}
                      >
                        <FormControl>
                          <SelectTrigger aria-required="true">
                            <SelectValue placeholder="Select degree" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="any">Select Degree</SelectItem>
                          {degreeOptions.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">e.g., B.Tech, M.Tech, MBA</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Branch */}
                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Required>Branch</Required>
                      </FormLabel>
                      <Select
                        value={field.value || "any"}
                        onValueChange={(val) => field.onChange(val === "any" ? "" : val)}
                      >
                        <FormControl>
                          <SelectTrigger aria-required="true">
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="any">Select Branch</SelectItem>
                          {branchOptions.map((b) => (
                            <SelectItem key={b} value={b}>
                              {b}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Graduation Year */}
                <FormField
                  control={form.control}
                  name="graduation_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Required>Graduation Year</Required>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="numeric"
                          placeholder="2022"
                          value={field.value?.toString() ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          aria-required="true"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Company */}
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Google / Infosys ..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Job Role */}
                <FormField
                  control={form.control}
                  name="job_role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Role / Designation</FormLabel>
                      <FormControl>
                        <Input placeholder="Software Engineer ..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* LinkedIn */}
                <FormField
                  control={form.control}
                  name="linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn</FormLabel>
                      <FormControl>
                        <Input placeholder="https://linkedin.com/in/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              {/* Avatar & Consents – new row */}
              <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Avatar uploader with drag look, preview, progress, remove */}
                <div className="space-y-2">
                  <FormLabel>Profile Photo (optional)</FormLabel>

                  <label
                    className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-dashed p-3 hover:bg-muted/50"
                    aria-label="Upload profile photo"
                  >
                    <span className="text-sm text-muted-foreground">
                      Drag & drop or click to choose an image (max 5MB)
                    </span>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        setAvatarFile(f);
                      }}
                    />
                    <Button type="button" variant="secondary" size="sm">
                      Choose
                    </Button>
                  </label>

                  {(avatarPreview || w.avatar_url) && (
                    <div className="flex items-center gap-3">
                      {/* blob: preview uses <img> */}
                      <img
                        src={avatarPreview || (w.avatar_url ?? "")}
                        alt="Avatar preview"
                        className="h-16 w-16 rounded-full object-cover border"
                      />
                      <Button type="button" variant="outline" onClick={handleRemoveAvatar}>
                        Remove
                      </Button>
                    </div>
                  )}

                  {isUploading && (
                    <div className="h-1 w-full overflow-hidden rounded bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${uploadPct}%` }}
                      />
                    </div>
                  )}

                  {/* Keep hidden input bound to RHF for stored URL */}
                  <input type="hidden" value={w.avatar_url || ""} readOnly />
                </div>

                {/* Consents */}
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="consent_terms"
                    render={({ field }) => (
                      <FormItem className="flex items-start gap-2">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div>
                          <FormLabel>
                            <Required>I accept the Terms &amp; Conditions</Required>
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">
                            You must accept to continue.
                          </p>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="consent_privacy"
                    render={({ field }) => (
                      <FormItem className="flex items-start gap-2">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div>
                          <FormLabel>
                            <Required>I accept the Privacy Policy</Required>
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Your data is stored securely and can be updated later.
                          </p>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              {/* Submit */}
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={disabled}
                >
                  {isUploading ? "Uploading…" : isSaving ? "Saving…" : "Complete Onboarding"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  You can update details anytime from your dashboard.
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
