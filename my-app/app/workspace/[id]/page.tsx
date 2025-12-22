import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { WorkspaceCanvas } from "@/components/workspace-canvas"
import { WorkspaceHeader } from "@/components/workspace-header"
import { WorkspaceSidebar } from "@/components/workspace-sidebar"

export default async function WorkspacePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const resolvedParams = await Promise.resolve(params)
  const projectId = resolvedParams.id

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch user's categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .eq("project_id", projectId)
    .order("position", { ascending: true })

  // Fetch user's notes
  const { data: notes } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", user.id)
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false })

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <WorkspaceHeader user={user} />
      <div className="flex flex-1 overflow-hidden">
        <WorkspaceSidebar categories={categories || []} userId={user.id} projectId={projectId} />
        <WorkspaceCanvas notes={notes || []} categories={categories || []} userId={user.id} />
      </div>
    </div>
  )
}
