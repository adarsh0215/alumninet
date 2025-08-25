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

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState<string>("");

  // Avatar local state (for upload + preview)
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Prefill email (read-only display)
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) return;
      setEmail(data.user?.email ?? "");
    })();
  }, [supabase]);

  // Manage preview URL lifecycle
  useEffect(() => {
    if (!avatarFile) {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [avatarFile]);

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

  // Options
  const degreeOptions = useMemo(
    () => ["B.Tech", "B.E.", "M.Tech", "M.E.", "B.Sc", "M.Sc", "MBA", "Ph.D"],
    []
  );
  const branchOptions = useMemo(
    () => [
      "CSE",
      "ECE",
      "EEE",
      "IT",
      "Mechanical",
      "Civil",
      "Chemical",
      "AI/ML",
      "Data Science",
      "Other",
    ],
    []
  );

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
      const path = `profiles/${userId}/${Date.now()}-${file.name}`;

      const { data, error } = await supabase
        .storage
        .from("avatars")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) throw error;

      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(data.path);
      return pub.publicUrl;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload avatar";
      toast.error(msg);
      return null;
    } finally {
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
      if (publicUrl) {
        values.avatar_url = publicUrl;
      }
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

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    // Keep preview state cleanup in effect hook
    form.setValue("avatar_url", ""); // ensures we don’t keep a stale URL
  };

  return (
    <div className="flex justify-center mt-12">
      <Card className="w-[600px]">
        <CardHeader>
          <CardTitle>Onboarding</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Email (read-only) */}
              <div>
                <FormLabel>Email</FormLabel>
                <Input value={email} readOnly />
              </div>

              {/* Full Name */}
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
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
                      <Input placeholder="+91..." {...field} />
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
                    <FormLabel>Degree *</FormLabel>
                    <Select
                      value={field.value || "any"}
                      onValueChange={(val) => field.onChange(val === "any" ? "" : val)}
                    >
                      <FormControl>
                        <SelectTrigger>
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
                    <FormLabel>Branch *</FormLabel>
                    <Select
                      value={field.value || "any"}
                      onValueChange={(val) => field.onChange(val === "any" ? "" : val)}
                    >
                      <FormControl>
                        <SelectTrigger>
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
                    <FormLabel>Graduation Year *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="2022"
                        value={field.value?.toString() ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
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

              {/* Avatar (file uploader → Storage) + Preview + Remove */}
              <div className="space-y-2">
                <FormLabel>Profile Photo (optional)</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setAvatarFile(f);
                  }}
                />
                {avatarPreview ? (
                  <div className="flex items-center gap-3">
                    {/* Use <img> for blob: URL to avoid next/image domain config */}
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="h-16 w-16 rounded-full object-cover border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRemoveAvatar}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    You can upload a square image for best results. Max 5MB.
                  </p>
                )}
              </div>

              {/* Consents */}
              <FormField
                control={form.control}
                name="consent_terms"
                render={({ field }) => (
                  <FormItem className="flex gap-2 items-start">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div>
                      <FormLabel>I accept the Terms & Conditions *</FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="consent_privacy"
                render={({ field }) => (
                  <FormItem className="flex gap-2 items-start">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div>
                      <FormLabel>I accept the Privacy Policy *</FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={requiredIncomplete || isSaving || isUploading}
              >
                {isUploading ? "Uploading..." : isSaving ? "Saving..." : "Complete Onboarding"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
