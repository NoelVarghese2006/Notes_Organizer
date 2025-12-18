"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Plus, FolderOpen, Sparkles } from "lucide-react"
import { createClient } from "@/lib/client"
import { useRouter } from "next/navigation"
import { useCategoriesStore, useNotesStore } from "@/lib/store"
import { Category } from "@/lib/store"

interface WorkspaceSidebarProps {
  categories: Category[]
  userId: string
  projectId: string
}

export function WorkspaceSidebar({ categories: initialCategories, userId, projectId }: WorkspaceSidebarProps) {
  //const [categories, setCategories] = useState(initialCategories)
  const [bulkText, setBulkText] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const notes = useNotesStore()
  const categories = useCategoriesStore()

  const handleBulkCreate = async () => {
    if (!bulkText.trim()) return

    setIsCreating(true)
    const lines = bulkText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    const catLine = lines.filter((line) => line.endsWith(":")).map((line) => line.slice(0, -1).trim())

    const noteLines = lines
    .filter((line) => !line.endsWith(":"))
    .map((line) =>
      line
        .replace(/^\s*(?:[-*•]\s*)?/, "")
        .trim()
    )


    const catsToCreate = catLine.map((catName, index) => ({
      user_id: userId,
      project_id: projectId,
      name: catName,
      color: "#94a3b8",
      position: categories.categories.length + index,
      position_x: 100 + (index % 5) * 280,
      position_y: 100 + Math.floor(index / 5) * 180,
    }))

    // Insert new categories if any
    if (catsToCreate.length > 0) {
      const { data: newCategories } = await supabase
        .from("categories")
        .insert(catsToCreate)
        .select()

      if (newCategories) {
        categories.setCategories([...categories.categories, ...newCategories])
      }
    }
    if(noteLines.length > 0) {
      // Create notes from lines
      const notesToCreate = noteLines.map((line, index) => ({
        user_id: userId,
        project_id: projectId,
        category: categories.categories[0].id || null,
        content: line,
        position_x: 100 + (index % 5) * 280,
        position_y: 100 + Math.floor(index / 5) * 180,
        width: 250,
        height: 150,
      }))

      const { data: newNotes, error } = await supabase.from("notes").insert(notesToCreate).select()

      if (newNotes) {
        notes.addNotes(newNotes)
      }

      if (error) {
        console.error("Error creating notes:", error)
      }
    }
    setBulkText("")
    setIsCreating(false)
    router.refresh()
  }

  return (
    <aside className="w-80 border-r border-border bg-muted/30 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-border">
        <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="size-4" />
          Import Notes
        </h2>
        <p className="text-xs text-muted-foreground mb-4">Paste your bullet points below</p>
        <Textarea
          placeholder="• First note&#10;• Second note&#10;• Third note"
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
          className="min-h-32 max-h-64 mb-3 font-mono text-sm"
        />
        <Button onClick={handleBulkCreate} disabled={isCreating || !bulkText.trim()} className="w-full gap-2">
          <Plus className="size-4" />
          {isCreating ? "Creating..." : "Create Notes"}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <FolderOpen className="size-4" />
          Categories
        </h2>
        <div className="space-y-2">
          {categories.categories.map((category) => (
              <Card key={category.id} className="p-3">
                <div className="flex items-center gap-2">
                  <label className="relative">
                    {/* Hidden color input */}
                    <input
                      type="color"
                      value={category.color}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) =>
                        categories.setCategories((prev) =>
                          prev.map((c) =>
                            c.id === category.id
                              ? { ...c, color: e.target.value }
                              : c
                          )
                        )
                      }
                    />

                    {/* Visible color circle */}
                    <div
                      className="size-4 rounded-full shrink-0 border"
                      style={{ backgroundColor: category.color }}
                    />
                  </label>

                  <span className="text-sm font-medium truncate">{category.name}</span>
                </div>
              </Card>
            ))}
        </div>
      </div>
    </aside>
  )
}
