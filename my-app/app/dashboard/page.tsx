import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CreateProjectDialog } from "@/components/new-project-dialog"


export default async function DashboardPage() {
  const supabase = await createClient()
  


  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch user's projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold">
            NoteFlow
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <form action="/login" method="post">
              <Button variant="outline" size="sm">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Projects</h1>
              <p className="text-muted-foreground">Create and manage your note organization projects</p>
            </div>
            <CreateProjectDialog userId={user.id} />
          </div>

          {!projects || projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">You don&apos;t have any projects yet</p>
                <CreateProjectDialog userId={user.id} />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link key={project.id} href={`/workspace/${project.id}`}>
                  <div className="border border-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer">
                    <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                    {project.description && <p className="text-muted-foreground text-sm">{project.description}</p>}
                    <p className="text-xs text-muted-foreground mt-4">
                      Created {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
