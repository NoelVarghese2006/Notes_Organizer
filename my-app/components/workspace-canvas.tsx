"use client"

import type React from "react"

import { useState, useRef } from "react"
import { NoteCard } from "@/components/note-card"
import { ZoomIn, ZoomOut, Move } from "lucide-react"
import { Button } from "@/components/ui/button"

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

interface Category {
  id: string
  name: string
  color: string
}

interface WorkspaceCanvasProps {
  notes: Note[]
  categories: Category[]
  userId: string
}

export function WorkspaceCanvas({ notes: initialNotes, categories, userId }: WorkspaceCanvasProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 2))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5))

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setIsPanning(true)
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const getCategoryColor = (categoryId: string | null) => {
    const category = categories.find((c) => c.id === categoryId)
    return category?.color || "#94a3b8"
  }

  return (
    <div className="flex-1 relative overflow-hidden bg-background">
      {/* Canvas Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button variant="secondary" size="icon" onClick={handleZoomOut} title="Zoom Out">
          <ZoomOut className="size-4" />
        </Button>
        <Button variant="secondary" size="icon" onClick={handleZoomIn} title="Zoom In">
          <ZoomIn className="size-4" />
        </Button>
        <div className="px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              color={getCategoryColor(note.category_id)}
              userId={userId}
              onUpdate={(updatedNote) => {
                setNotes((prev) => prev.map((n) => (n.id === updatedNote.id ? updatedNote : n)))
              }}
              onDelete={(noteId) => {
                setNotes((prev) => prev.filter((n) => n.id !== noteId))
              }}
            />
          ))}
        </div>
      </div>

      {notes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center max-w-md">
            <Move className="size-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Your canvas is empty</h3>
            <p className="text-sm text-muted-foreground">
              Import notes from the sidebar to start organizing them visually
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
