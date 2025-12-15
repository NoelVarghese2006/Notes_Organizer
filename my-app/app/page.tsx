import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Sparkles, Layers, Download } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <Layers className="size-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">NoteFlow</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </Link>
            <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
          </nav>
          <Link href="/auth/sign-up">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm mb-6">
            <Sparkles className="size-4" />
            <span>Transform your messy notes</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Organize your thoughts visually, export with clarity
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 text-balance max-w-2xl mx-auto">
            Paste your unorganized bullet points, drag them into categories on a visual canvas, and export them back as
            clean, structured notes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button size="lg" className="gap-2">
                Start Organizing Free
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline">
                See How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to organize</h2>
            <p className="text-muted-foreground text-lg">Simple, intuitive, and powerful</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <svg className="size-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Paste & Parse</h3>
              <p className="text-muted-foreground">
                Simply paste your messy bullet points. Our smart parser creates individual draggable note cards
                instantly.
              </p>
            </Card>
            <Card className="p-6">
              <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <svg className="size-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Drag & Organize</h3>
              <p className="text-muted-foreground">
                Drag note cards around a visual canvas. Group them by category, color-code them, and see your thoughts
                take shape.
              </p>
            </Card>
            <Card className="p-6">
              <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Download className="size-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Export Clean</h3>
              <p className="text-muted-foreground">
                Export your organized notes back to bullet points, grouped by category with timestamps and clean
                formatting.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-muted-foreground text-lg">Three simple steps to organized notes</p>
          </div>
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Import your notes</h3>
                <p className="text-muted-foreground">
                  Copy and paste your unorganized bullet points. Each line becomes a draggable card on your canvas.
                </p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Organize visually</h3>
                <p className="text-muted-foreground">
                  Drag cards around, assign categories, add colors. Group related ideas together and see patterns
                  emerge.
                </p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Export organized</h3>
                <p className="text-muted-foreground">
                  Download your notes as clean, categorized bullet points. Perfect for documentation, planning, or
                  sharing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to organize your thoughts?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Start transforming your messy notes into beautifully organized structures today.
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg" className="gap-2">
              Get Started for Free
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-lg bg-primary flex items-center justify-center">
                <Layers className="size-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">NoteFlow</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 NoteFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
