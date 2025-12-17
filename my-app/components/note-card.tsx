"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { GripVertical, X, Edit2, Check } from "lucide-react"
import { createClient } from "@/lib/client"

interface Note {
  id: string
  content: string
  category_id: string | null
  position_x: number
  position_y: number
  width: number
  height: number
  created_at: string
}

interface NoteCardProps {
  note: Note
  color: string
  userId: string
  onUpdate: (note: Note) => void
  onDelete: (noteId: string) => void
}

export function NoteCard({ note, color, userId, onUpdate, onDelete }: NoteCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(note.content)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLButtonElement) return

    setIsDragging(true)
    setDragStart({
      x: e.clientX - note.position_x,
      y: e.clientY - note.position_y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      onUpdate({ ...note, position_x: newX, position_y: newY })
    }
  }

  const handleMouseUp = async () => {
    if (isDragging) {
      setIsDragging(false)
      // Save position to database
      await supabase
        .from("notes")
        .update({
          position_x: note.position_x,
          position_y: note.position_y,
        })
        .eq("id", note.id)
        .eq("user_id", userId)
    }
  }

  const handleSaveEdit = async () => {
    if (editContent.trim() === "") return

    await supabase
      .from("notes")
      .update({
        content: editContent,
      })
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
    <Card
      ref={cardRef}
      className="absolute cursor-move shadow-lg hover:shadow-xl transition-shadow select-none"
      style={{
        left: note.position_x,
        top: note.position_y,
        width: note.width,
        minHeight: note.height,
        borderLeftWidth: 4,
        borderLeftColor: color,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="p-3 h-full flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <GripVertical className="size-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
          <div className="flex gap-1">
            {isEditing ? (
              <Button variant="ghost" size="icon" className="size-6" onClick={handleSaveEdit}>
                <Check className="size-3" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" className="size-6" onClick={() => setIsEditing(true)}>
                <Edit2 className="size-3" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="size-6 text-destructive" onClick={handleDelete}>
              <X className="size-3" />
            </Button>
          </div>
        </div>
        {isEditing ? (
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="flex-1 min-h-20 text-sm resize-none"
            autoFocus
          />
        ) : (
          <p className="text-sm flex-1 leading-relaxed">{note.content}</p>
        )}
        <div className="text-xs text-muted-foreground mt-2">
          {new Date(note.created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </Card>
  )
}
