"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Plus, FolderOpen, Sparkles } from "lucide-react"
import { createClient } from "@/lib/client"
import { useRouter } from "next/navigation"

interface Category {
  id: string
  name: string
  color: string
  position: number
}

interface WorkspaceSidebarProps {
  categories: Category[]
  userId: string
}

export function WorkspaceSidebar({ categories: initialCategories, userId }: WorkspaceSidebarProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [bulkText, setBulkText] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleBulkCreate = async () => {
    if (!bulkText.trim()) return

    setIsCreating(true)
    const lines = bulkText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    // Get first category (or create default if none)
    let categoryId = categories[0]?.id

    if (!categoryId) {
      const { data: newCategory } = await supabase
        .from("categories")
        .insert({
          user_id: userId,
          name: "Uncategorized",
          color: "#94a3b8",
          position: 0,
        })
        .select()
        .single()

      if (newCategory) {
        categoryId = newCategory.id
        setCategories([newCategory])
      }
    }

    const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: userId,
      name: "My Project", // or whatever name you want
    })
    .select("id")
    .single()

    if (projectError) {
      console.error(projectError)
      throw projectError
    }

    const projectId = project.id

    // Create notes from lines
    const notesToCreate = lines.map((line, index) => ({
      user_id: userId,
      project_id: projectId,
      category: categoryId,
      content: line,
      position_x: 100 + (index % 5) * 280,
      position_y: 100 + Math.floor(index / 5) * 180,
      width: 250,
      height: 150,
    }))

    await supabase.from("notes").insert(notesToCreate)

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
          className="min-h-32 mb-3 font-mono text-sm"
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
          {categories.map((category) => (
            <Card key={category.id} className="p-3">
              <div className="flex items-center gap-2">
                <div className="size-4 rounded-full shrink-0" style={{ backgroundColor: category.color }} />
                <span className="text-sm font-medium truncate">{category.name}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </aside>
  )
}
