"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X, Edit2, Check } from "lucide-react"
import { createClient } from "@/lib/client"
import { Note } from "@/lib/store"

interface NoteCardProps {
  note: Note
  color: string
  userId: string
  onDropToColumn: (noteId: string, x: number) => void
  onUpdate: (note: Note) => void
  onDelete: (noteId: string) => void
}

export function NoteCard({ note, color, userId, onDropToColumn, onUpdate, onDelete }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(note.content)
  const supabase = createClient()

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return

    await supabase
      .from("notes")
      .update({ content: editContent })
      .eq("id", note.id)
      .eq("user_id", userId)

    onUpdate({ ...note, content: editContent })
    setIsEditing(false)
  }

  const handleDelete = async () => {
    await supabase.from("notes").delete().eq("id", note.id).eq("user_id", userId)
    onDelete(note.id)
  }

  return (
    // <Card
    //   draggable
    //   onDragStart={(e) => {
    //     // e.preventDefault()
    //     e.dataTransfer.setData("noteId", note.id)
    //     e.dataTransfer.effectAllowed = "move"
    //     //e.dataTransfer.setDragImage(new Image(), 0, 0)
    //   }}
    // >
    //   <p>{note.content}</p>
    // </Card>
    <Card
      draggable={!isEditing}
      onDragStart={(e) => {
        e.dataTransfer.setData("noteId", note.id)
        e.dataTransfer.effectAllowed = "move"
      }}
      className="shadow-sm select-none cursor-grab active:cursor-grabbing"
      style={{
        borderLeftWidth: 4,
        borderLeftColor: color,
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
            <Button
              draggable={false}
              onMouseDown={(e) => e.stopPropagation()} // <-- added this
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="size-3" />
            </Button>
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
          <p className="text-sm">{note.content}</p>
        )}
      </div>
    </Card>

  )
}
