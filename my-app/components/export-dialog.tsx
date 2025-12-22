"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/client"
import { Download, Copy, Check } from "lucide-react"
import { Category, Note } from "@/lib/store"

interface ExportDialogProps {
  open: boolean
  onClose: () => void
  userId: string
  projectId: string
}

export function ExportDialog({ open, onClose, userId, projectId }: ExportDialogProps) {
  const [exportText, setExportText] = useState("")
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      generateExport()
    }
  }, [open])

  const generateExport = async () => {
    setIsLoading(true)

    // Fetch categories and notes
    const { data: categories } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .eq("project_id", projectId)
      .order("position_x", { ascending: true })

    const { data: notes } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("order_index", { ascending: true })

    if (!categories || !notes) {
      setExportText("No notes to export")
      setIsLoading(false)
      return
    }

    // Group notes by category
    const notesMap = new Map<string, Note[]>()

    // Initialize with all categories
    categories.forEach((cat) => {
      notesMap.set(cat.id, [])
    })

    // Add uncategorized section
    notesMap.set("uncategorized", [])

    // Distribute notes
    notes.forEach((note) => {
      if (note.category && notesMap.has(note.category)) {
        notesMap.get(note.category)!.push(note)
      } else {
        notesMap.get("uncategorized")!.push(note)
      }
    })

    // Build export text
    let output = `*Matters for Praises and Prayers – `
    output += `Dated ${new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}*\n\n`
    output += `---\n\n`

    categories.forEach((category) => {
      const categoryNotes = notesMap.get(category.id) || []
      if (categoryNotes.length > 0) {
        output += `*${category.name}*\n\n`
        categoryNotes.forEach((note) => {
          output += `• ${note.content}\n`
        })
        output += `\n`
      }
    })

    // Add uncategorized if any
    const uncategorized = notesMap.get("uncategorized") || []
    if (uncategorized.length > 0) {
      output += `## Uncategorized\n\n`
      uncategorized.forEach((note) => {
        output += `• ${note.content}\n`
      })
      output += `\n`
    }

    output += `---\n\n`
    // output += `Total notes: ${notes.length}\n`
    // output += `Categories: ${categories.length}\n`

    setExportText(output)
    setIsLoading(false)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(exportText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([exportText], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `noteflow-export-${new Date().toISOString().split("T")[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Export Your Notes</DialogTitle>
          <DialogDescription>Your notes organized by category, ready to copy or download as markdown</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-scroll">
          <Textarea
            value={exportText}
            readOnly
            className="h-full min-h-96 font-mono text-sm resize-none"
            placeholder={isLoading ? "Generating export..." : ""}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline" onClick={handleCopy} className="gap-2 bg-transparent">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copied!" : "Copy to Clipboard"}
          </Button>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="size-4" />
            Download as Markdown
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
