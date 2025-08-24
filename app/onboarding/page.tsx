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

function Required({ children }: { children: string }) {
  return (
    <span>
      {children} <span className="text-destructive">*</span>
    </span>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [authEmail, setAuthEmail] = useState<string>("");

  useEffect(() => {
    (async () => {
      const supabase = supabaseBrowser();
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        toast.error("Failed to load your session. Please login again.");
        return;
      }
      setAuthEmail(data.user?.email ?? "");
    })();
  }, []);

  // Cast to quiet minor resolver type mismatches across versions
  const resolver = zodResolver(onboardingSchema) as unknown as Resolver<OnboardingForm>;

  const form = useForm<OnboardingForm>({
    resolver,
    defaultValues: {
      full_name: "",
      phone: "",
      graduation_year: new Date().getFullYear(),
      degree: "",
      branch: "",
      company: "",
      job_role: "",
      location: "",
      linkedin: "",
      avatar_url: "",
      consent_terms: false,
      consent_privacy: false,
    },
    mode: "onChange",
    reValidateMode: "onChange",
    criteriaMode: "firstError",
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

  // Watch required fields to control disabled state
  const fullName = form.watch("full_name");
  const degree = form.watch("degree");
  const branch = form.watch("branch");
  const grad = form.watch("graduation_year");
  const acceptTerms = form.watch("consent_terms");
  const acceptPrivacy = form.watch("consent_privacy");

  const gradValid = grad !== undefined && grad !== null && !Number.isNaN(Number(grad));
  const requiredIncomplete =
    fullName.trim().length < 2 ||
    degree.trim().length === 0 ||
    branch.trim().length === 0 ||
    !gradValid ||
    !acceptTerms ||
    !acceptPrivacy;

  const onSubmit: SubmitHandler<OnboardingForm> = async (values) => {
    if (requiredIncomplete) {
      toast.error("Please fill all required fields and accept the consents");
      return;
    }

    const supabase = supabaseBrowser();
    try {
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
        email: user.email, // auto-store email
        ...values,
        full_name: values.full_name.trim(),
        degree: values.degree.trim(),
        branch: values.branch.trim(),
        onboarded: true,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Onboarding complete!");
      router.push("/dashboard");
    } catch (e: any) {
      toast.error(e?.message || "Unexpected error while saving your profile");
    }
  };

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
              {/* Read-only email from session */}
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input value={authEmail} disabled readOnly />
                </FormControl>
                <FormMessage />
              </FormItem>

              {/* Full name (required) */}
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Required>Full Name</Required>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} aria-required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone (optional) */}
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

              {/* Graduation Year (required) */}
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
                        aria-required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Degree (required) - shadcn Select using "any" */}
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
                        <SelectTrigger aria-required>
                          <SelectValue placeholder="Select degree" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="any">Select Degree</SelectItem>
                        {degreeOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Branch (required) - shadcn Select using "any" */}
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
                        <SelectTrigger aria-required>
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="any">Select Branch</SelectItem>
                        {branchOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Optional fields */}
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
                      <FormLabel>
                        <Required>I accept the Terms & Conditions</Required>
                      </FormLabel>
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
                      <FormLabel>
                        <Required>I accept the Privacy Policy</Required>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={requiredIncomplete || isSaving}>
                {isSaving ? "Saving..." : "Complete Onboarding"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
