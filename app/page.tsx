import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Carousel } from "@/components/ui/carousel"

export default function HomePage() {
  return (
    <main className="flex flex-col">
      {/* Hero Section */}
      <section className="container mx-auto py-16 flex flex-col items-center text-center gap-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Connect. Grow. Give Back.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
          Welcome to the Alumni Network — a place to reconnect with peers, mentor the next generation, and unlock opportunities.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg">Join Now</Button>
          <Button size="lg" variant="secondary">Browse Directory</Button>
        </div>
      </section>

      {/* Carousel Gallery */}
      <section className="bg-muted/30 py-12">
        <div className="container">
          <Carousel />
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="container py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-10">
          Why Join?
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Networking", desc: "Reconnect with batchmates and build lasting connections." },
            { title: "Mentorship", desc: "Guide juniors or find mentors to navigate your career." },
            { title: "Jobs", desc: "Discover and share job opportunities within the network." },
            { title: "Perks", desc: "Get exclusive alumni perks and campus privileges." },
            { title: "Community", desc: "Stay updated with alumni events and reunions." },
            { title: "Nostalgia", desc: "Cherish your campus memories with photo galleries." },
          ].map(({ title, desc }) => (
            <Card key={title} className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {desc}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
