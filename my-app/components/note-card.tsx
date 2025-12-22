"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X, Edit2, Check } from "lucide-react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { createClient } from "@/lib/client"
import { Note } from "@/lib/store"

interface NoteCardProps {
  note: Note
  color: string
  userId: string
  zoom: number
  isFirst: boolean
  isLast: boolean
  //onDropToColumn: (noteId: string, x: number) => void
  onUpdate: (note: Note) => void
  onDelete: (noteId: string) => void
  onMove: (noteId: string, direction: "up" | "down") => void

}

export function NoteCard({ note, color, userId, zoom, isFirst, isLast, onUpdate, onDelete, onMove }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(note.content)
  const supabase = createClient()

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return

    await supabase
      .from("notes")
      .update({ content: editContent,
                updated_at: new Date().toISOString()
       })
      .eq("id", note.id)
      .eq("user_id", userId)

    onUpdate({ ...note, content: editContent, updated_at: new Date().toISOString() })
    setIsEditing(false)
  }

  const handleDelete = async () => {
    await supabase.from("notes").delete().eq("id", note.id).eq("user_id", userId)
    onDelete(note.id)
  }

  function getNoteColor(updatedAt: string | Date) {
    const updated = new Date(updatedAt)
    const now = new Date()

    const diffMs = now.getTime() - updated.getTime()
    const twoMonthsMs = 1000 * 60 * 60 * 24 * 60 // ~60 days

    if (diffMs > twoMonthsMs) return "text-red-300"
    return "text-inherit" // or text-gray-800, etc.
  }


  return (
    <Card
      draggable={!isEditing}
      className="shadow-sm select-none cursor-grab active:cursor-grabbing"
      style={{
        borderLeftWidth: 4,
        borderLeftColor: color,
      }}
      onDragStart={(e) => {
        e.dataTransfer.setData("noteId", note.id)
        e.dataTransfer.effectAllowed = "move"

        const target = e.currentTarget as HTMLElement
        const clone = target.cloneNode(true) as HTMLElement

        const scale = 0.6 / zoom

        clone.style.width = `${target.offsetWidth}px`
        clone.style.opacity = "0.6"
        clone.style.transform = `scale(${scale})`
        clone.style.transformOrigin = "center"
        clone.style.pointerEvents = "none"
        clone.style.position = "absolute"
        clone.style.top = "-9999px"
        clone.style.left = "-9999px"

        document.body.appendChild(clone)

        e.dataTransfer.setDragImage(
          clone,
          target.offsetWidth / 2,
          target.offsetHeight / 2
        )

        requestAnimationFrame(() => {
          document.body.removeChild(clone)
        })
      }}
    >
      <div className="p-3 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          {isEditing ? (
            <Button
              draggable={false}
              onMouseDown={(e) => e.stopPropagation()}
              variant="ghost"
              size="icon"
              onClick={handleSaveEdit}
            >
              <Check className="size-3" />
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button
                draggable={false}
                onMouseDown={(e) => e.stopPropagation()} // <-- added this
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="size-3" />
              </Button>
            
              <Button
                draggable={false}
                onMouseDown={(e) => e.stopPropagation()}
                variant="ghost"
                size="icon"
                disabled={isFirst}
                onClick={() => onMove(note.id, "up")}
              >
                <ChevronUp className="size-3" />
              </Button>

              <Button
                draggable={false}
                onMouseDown={(e) => e.stopPropagation()}
                variant="ghost"
                size="icon"
                disabled={isLast}
                onClick={() => onMove(note.id, "down")}
              >
                <ChevronDown className="size-3" />
              </Button>
            </div>
          )}
          <Button
            draggable={false}
            onMouseDown={(e) => e.stopPropagation()} // <-- added this
            variant="ghost"
            size="icon"
            onClick={handleDelete}
          >
            <X className="size-3" />
          </Button>
        </div>

        {isEditing ? (
          <Textarea
            draggable={false}
            onMouseDown={(e) => e.stopPropagation()}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="text-sm resize-none"
            autoFocus
          />
        ) : (
          <p className={`text-sm ${getNoteColor(note.updated_at)}`}>{note.content}</p>
        )}
      </div>
    </Card>

  )
}
