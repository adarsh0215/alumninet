// app/page.tsx
import Link from "next/link";
import {
  Users,
  GraduationCap,
  Briefcase,
  Handshake,
  Gift,
  CalendarDays,
  Images,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel } from "@/components/ui/carousel";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col">
      {/* Hero */}
      <section
        aria-label="Welcome"
        className="relative overflow-hidden"
      >
        {/* soft radial + grid background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/10),transparent_60%)]" />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_right,transparent,transparent_95%,theme(colors.border)_95%),linear-gradient(to_bottom,transparent,transparent_95%,theme(colors.border)_95%)] bg-[size:28px_28px]"
          />
        </div>

        <div className="container mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center md:gap-7 md:py-24">
          <span className="rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            A trusted Alumni Network
          </span>

          <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Connect. Collaborate. <br />
            <span className="text-primary">Contribute.</span>
          </h1>

          <p className="text-balance max-w-2xl text-lg text-muted-foreground md:text-xl">
            Welcome to the NIT Durgapur International Alumni Network — Delhi Chapter.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-1.5">
            <Button asChild size="lg" aria-label="Join the network">
              <Link href="/auth/login?redirect=/onboarding">Join Now</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" aria-label="Browse the alumni directory">
              <Link href="/directory">Browse Directory</Link>
            </Button>
          </div>

          {/* Quick benefits pills */}
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Users className="h-4 w-4" aria-hidden />
              Trusted community
            </li>
            <li className="flex items-center gap-2">
              <Handshake className="h-4 w-4" aria-hidden />
              Mentorship &amp; referrals
            </li>
            <li className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" aria-hidden />
              Job opportunities
            </li>
          </ul>
        </div>
      </section>

      {/* Gallery / Carousel */}
      <section aria-label="Campus & Alumni moments" className="bg-muted/30 py-12 md:py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg font-semibold">
                Glimpses from our community
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <Carousel />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits grid */}
      <section aria-label="Why join" className="container mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
          <h2 className="text-2xl font-semibold md:text-3xl">Why Join?</h2>
          <p className="mt-2 text-muted-foreground">
            Everything you need to stay connected, give back, and grow.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map(({ title, desc, Icon }) => (
            <Card
              key={title}
              className="rounded-2xl shadow-sm transition-colors hover:bg-muted/40"
            >
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {desc}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats strip (social proof) */}
      <section aria-label="Highlights" className="border-t bg-background/50">
        <div className="container mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4">
          {STATS.map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-semibold md:text-3xl">{value}</div>
              <div className="text-xs text-muted-foreground md:text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section aria-label="Get started" className="container mx-auto max-w-6xl px-4 pb-20 pt-12 md:pt-16">
        <Card className="rounded-2xl border-primary/20 bg-primary/5 shadow-sm">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center md:flex-row md:justify-between md:text-left">
            <div>
              <h3 className="text-lg font-semibold md:text-xl">Ready to jump in?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your profile in minutes and request access to the directory.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild size="lg">
                <Link href="/auth/login?redirect=/onboarding">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/directory">Explore Directory</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

/* ------------------------- helpers ------------------------- */

const BENEFITS = [
  {
    title: "Networking, Business & Services",
    desc:
      "Expand your professional reach — build connections, exchange referrals, and showcase services within a trusted alumni community.",
    Icon: Users,
  },
  {
    title: "Mentorship & Guidance",
    desc:
      "Give back as a mentor. Support undergraduates, guide aspiring professionals, or coach peers exploring new passions.",
    Icon: Handshake,
  },
  {
    title: "Jobs & Internships",
    desc:
      "Create opportunities that matter. Share openings from your company or network to help students and fellow alumni.",
    Icon: Briefcase,
  },
  {
    title: "Exclusive Member Benefits",
    desc:
      "Enjoy alumni-only perks — curated discounts and creative offers designed to add real value to your membership.",
    Icon: Gift,
  },
  {
    title: "Community Activities",
    desc:
      "Stay engaged beyond work. Join social, cultural, and community initiatives organized by the alumni association.",
    Icon: CalendarDays,
  },
  {
    title: "Nostalgia & Updates",
    desc:
      "Relive campus memories and make new ones. Attend reunions and events, and stay updated on alumni achievements.",
    Icon: Images,
  },
] as const;

const STATS = [
  { label: "Active Alumni", value: "3,200+" },
  { label: "Mentors", value: "450+" },
  { label: "Open Roles", value: "120+" },
  { label: "Cities", value: "35+" },
] as const;
