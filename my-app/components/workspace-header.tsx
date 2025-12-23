"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/client"
import { Layers, LogOut, Download, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { ExportDialog } from "@/components/export-dialog"
import { useCategoriesStore, useNotesStore } from "@/lib/store"

interface WorkspaceHeaderProps {
  user: User
  projectId: string
}
export function WorkspaceHeader({ user, projectId }: WorkspaceHeaderProps) {
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const notes = useNotesStore()
  const categories = useCategoriesStore()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleSave = async () => {
    setIsSaving(true)
    await Promise.all([
      notes.saveAll(supabase),
      categories.saveAll?.(supabase),
    ])
    setIsSaving(false)
  }

  return (
    <>
      <header className="border-b border-border bg-background">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <Layers className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">NoteFlow</h1>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              className="gap-2"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="size-4" />
              <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save"}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
              onClick={() => setShowExportDialog(true)}
            >
              <Download className="size-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>

            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>

          </div>
        </div>
      </header>

      <ExportDialog open={showExportDialog} onClose={() => setShowExportDialog(false)} userId={user.id} projectId={projectId} />
    </>
  )
}
