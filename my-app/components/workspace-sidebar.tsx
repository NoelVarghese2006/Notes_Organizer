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
  const [isOpen, setIsOpen] = useState(false)

  const router = useRouter()
  const supabase = createClient()
  const notes = useNotesStore()
  const categories = useCategoriesStore()

  const handleBulkCreate = async () => {
    if (!bulkText.trim()) return
    setIsCreating(true)

    // ---------- 1. Parse input ----------
    type ParsedNote = {
      content: string
      categoryName: string | null
    }

    const parsedNotes: ParsedNote[] = []
    const categoryNames: string[] = []

    let currentCategory: string | null = null

    for (const rawLine of bulkText.split("\n")) {
      const raw = rawLine.trim()
if (!raw) continue

// 1. Strip surrounding markdown emphasis
      const cleaned = raw
        .replace(/^[_*]+/, "")
        .replace(/[_*]+$/, "")

      // 2. Check for category line (colon at end)
      if (cleaned.endsWith(":")) {
        currentCategory = cleaned.trim()
        categoryNames.push(currentCategory)
        continue
      }

      parsedNotes.push({
        content: cleaned.replace(/^\s*(?:[-*•]\s*)?/, "").trim(),
        categoryName: currentCategory,
      })
    }

    // ---------- 2. Create categories ----------
    let newCategories: any[] = []

    if (categoryNames.length > 0) {
      const catsToCreate = categoryNames.map((catName, index) => ({
        user_id: userId,
        project_id: projectId,
        name: catName,
        color: "#94a3b8",
        position: categories.categories.length + index,
        position_x: 100 + (index) * 400,
        position_y: 200,
      }))

      const { data } = await supabase
        .from("categories")
        .insert(catsToCreate)
        .select()

      if (data) {
        newCategories = data
        categories.setCategories([...categories.categories, ...data])
      }
    }

    // ---------- 3. Build lookup ----------
    const categoryIdByName = new Map<string, string>()

    categories.categories.forEach((c) =>
      categoryIdByName.set(c.name, c.id)
    )

    newCategories.forEach((c) =>
      categoryIdByName.set(c.name, c.id)
    )

    // ---------- 4. Create notes ----------
    if (parsedNotes.length > 0) {
      const categoryCounters = new Map<string, number>()

      const notesToCreate = parsedNotes.map((note) => {
      const categoryId =
        categoryIdByName.get(note.categoryName ?? "") ??
        categories.getByName("Uncategorized")?.id

      // Get current index for this category
      const currentIndex = categoryCounters.get(categoryId || "") || 0
      categoryCounters.set(categoryId || "", currentIndex + 1)

      return {
        user_id: userId,
        project_id: projectId,
        category: categoryId,
        content: note.content,
        width: 250,
        height: 150,
        order_index: currentIndex, // local to column now
      }})

      const { data: newNotes, error } = await supabase
        .from("notes")
        .insert(notesToCreate)
        .select()

      if (newNotes) notes.addNotes(newNotes)
      if (error) console.error("Error creating notes:", error)
    }

    setBulkText("")
    setIsCreating(false)
    router.refresh()
  }


  return (
    <>
    <Button
      variant="ghost"
      size="icon"
      className="fixed top-4 left-4 z-50 md:hidden"
      onClick={() => setIsOpen((v) => !v)}
    >
      {isOpen ? "" : ""}
    </Button>
    <aside className={`
    fixed
    md:static z-40
    h-full
    w-80
    border-r border-border
    bg-muted/30
    flex flex-col
    overflow-hidden
    transition-transform duration-300 ease-in-out
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0
  `}>
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
    </>
  )
}
