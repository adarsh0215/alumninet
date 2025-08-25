// app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Briefcase,
  GraduationCap,
  Users,
  ShieldCheck,
  Handshake,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  const benefits = [
    {
      icon: Briefcase,
      title: "Networking, Business & Services",
      desc:
        "Expand your professional reach — build connections, exchange referrals, and showcase services within a trusted alumni community.",
    },
    {
      icon: Users,
      title: "Mentorship & Guidance",
      desc:
        "Give back as a mentor. Support undergraduates, guide aspiring professionals, or coach peers exploring new passions.",
    },
    {
      icon: Handshake,
      title: "Jobs & Internships",
      desc:
        "Create opportunities that matter. Share openings from your company or network to help students and fellow alumni.",
    },
    {
      icon: ShieldCheck,
      title: "Exclusive Member Benefits",
      desc:
        "Enjoy alumni-only perks — curated discounts and creative offers designed to add real value to your membership.",
    },
    {
      icon: GraduationCap,
      title: "Community Activities",
      desc:
        "Stay engaged beyond work. Join social, cultural, and community initiatives organized by the alumni association.",
    },
    {
      icon: Sparkles,
      title: "Nostalgia & Updates",
      desc:
        "Relive campus memories and make new ones. Attend reunions and events, and stay updated on alumni achievements.",
    },
  ];

  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section className="relative">
        {/* soft gradient bg */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_500px_at_50%_-20%,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div className="container mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center md:py-20">
          <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Connect. Collaborate. Contribute.
          </h1>
          <p className="text-balance max-w-2xl text-lg text-muted-foreground md:text-xl">
            Welcome to the NITDIAN Alumni Network — a place to reconnect with
            peers, mentor the next generation, and unlock opportunities.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button asChild size="lg">
              <Link href="/auth/signup">Join Now</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/directory">Browse Directory</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="container mx-auto max-w-6xl px-4 py-10 md:py-16">
        <h2 className="text-center text-2xl font-semibold md:text-3xl">
          Why Join the Alumni Network?
        </h2>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="rounded-2xl transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <CardTitle className="text-base md:text-lg">{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {desc}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="border-t bg-muted/40">
        <div className="container mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h3 className="text-lg font-semibold md:text-xl">
              Ready to make your alumni network your superpower?
            </h3>
            <p className="text-sm text-muted-foreground md:text-base">
              Create your profile in minutes. Get discovered. Give back. Grow.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/auth/signup">Create Account</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/login">I already have an account</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
