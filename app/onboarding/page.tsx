// app/onboarding/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema, type OnboardingForm } from "@/lib/validation/onboarding";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState<string>("");

  // Prefill email (read-only display)
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) return;
      setEmail(data.user?.email ?? "");
    })();
  }, [supabase]);

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
    () => ["CSE", "ECE", "EEE", "IT", "Mechanical", "Civil", "Chemical", "AI/ML", "Data Science", "Other"],
    []
  );

  const onSubmit: SubmitHandler<OnboardingForm> = async (values) => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      toast.error("You must be logged in to complete onboarding");
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email ?? null,
      ...values,
      full_name: values.full_name.trim(),
      degree: values.degree.trim(),
      branch: values.branch.trim(),
      onboarded: true,
      // explicitly mark pending for admin review (even though DB has a default)
      moderation_status: "pending",
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Onboarding complete! Your profile is pending approval.");
    router.push("/dashboard");
  };

  // 🔧 Use 'watch' so the button state updates live
  const w = form.watch(); // subscribes to all fields; causes re-render on change
  const requiredIncomplete =
    !w.full_name?.trim() ||
    !w.degree?.trim() ||
    !w.branch?.trim() ||
    !Number.isFinite(Number(w.graduation_year)) ||
    !w.consent_terms ||
    !w.consent_privacy;

  const isSaving = form.formState.isSubmitting;

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

              {/* Avatar URL */}
              <FormField
                control={form.control}
                name="avatar_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

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
                disabled={requiredIncomplete || isSaving}
              >
                {isSaving ? "Saving..." : "Complete Onboarding"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
