"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { NoteCard } from "@/components/note-card"
import { ZoomIn, ZoomOut, Move } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardColumn } from "./cat-containers"
import { useCategoriesStore, useNotesStore } from "@/lib/store"
import { Note } from "@/lib/store"
import { Category } from "@/lib/store"
import { createClient } from "@/lib/client"
import { basename } from "path"

interface WorkspaceCanvasProps {
  notes: Note[]
  categories: Category[]
  userId: string
}

export function WorkspaceCanvas({ notes: initialNotes, categories: initialCategories, userId }: WorkspaceCanvasProps) {
  const notes = useNotesStore()
  const categories = useCategoriesStore()
  const supabase = createClient()
  const [zoom, setZoom] = useState(0.5)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)

  const hydrated = useRef(false)

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 2))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.2))

  const columnRefs = useRef<Record<string, HTMLDivElement>>({})

  useEffect(() => {
    if (hydrated.current) return
    hydrated.current = true

    notes.setNotes(initialNotes)
    categories.setCategories(initialCategories)
  }, [initialNotes, initialCategories])

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

  const onDropToColumn = (noteId: string, clientX: number) => {
    let closestColumnId: string | null = null
    let minDistance = Infinity

    for (const [columnId, el] of Object.entries(columnRefs.current)) {
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const distance = Math.abs(clientX - centerX)

      if (distance < minDistance) {
        minDistance = distance
        closestColumnId = columnId
      }
    }
  }

  const moveNoteToCategory = (noteId: string, categoryId: string) => {
      notes.setNotes((prev) => {
      // Find the note being moved
      const movingNote = prev.find((n) => n.id === noteId)
      if (!movingNote) return prev

      // If the note is already in the target category, do nothing
      if (movingNote.category === categoryId) return prev

      return prev.map((n) => {
        // Increment order_index of notes in the target category
        if (n.category === categoryId) {
          return { ...n, order_index: n.order_index + 1 }
        }

        // Update the moved note
        if (n.id === noteId) {
          return { ...n, category: categoryId, order_index: 0 }
        }

        // Everything else stays the same
        return n
      })
    })
  }

  const normalizeOrder = (notes: Note[]) =>
    notes.map((n, i) => ({ ...n, order_index: i }))

  const handleMoveNote = (noteId: string, direction: "up" | "down") => {
    notes.setNotes((prev) => {
      const grouped = prev.reduce<Record<string, Note[]>>((acc, n) => {
        acc[n.category] ||= []
        acc[n.category].push(n)
        return acc
      }, {})

      const result: Note[] = []

      for (const category in grouped) {
        const list = grouped[category]
          .sort((a, b) => a.order_index - b.order_index)

        const index = list.findIndex((n) => n.id === noteId)
        if (index === -1) {
          result.push(...list)
          continue
        }

        const targetIndex = direction === "up" ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= list.length) {
          result.push(...list)
          continue
        }

        ;[list[index], list[targetIndex]] = [
          list[targetIndex],
          list[index],
        ]

        result.push(...normalizeOrder(list))
      }

      return result
    })
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
          {categories.categories.map((category) => (
          <CardColumn
            key={category.id}
            id={category.id}
            title={category.name}
            userId={userId}
            x={category.position_x}
            y={category.position_y}
            color={category.color}
            registerRef={(el) => (columnRefs.current[category.id] = el)}
            onMoveNote={moveNoteToCategory}
            onUpdatePosition={(id, x, y) =>
              categories.setCategories((prev) =>
                prev.map((c) =>
                  c.id === id ? { ...c, position_x: x, position_y: y } : c
                )
              )
            }
          >
            {notes.notes
              .filter((n) => n.category === category.id)
              .sort((a, b) => a.order_index - b.order_index)
              .map((note, i, arr) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  color={category.color}
                  userId={userId}
                  zoom={zoom}
                  isFirst={i === 0}
                  isLast={i === arr.length - 1}
                  onMove={handleMoveNote}
                  onUpdate={(updatedNote) => {
                    notes.setNotes((prev) =>
                      prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
                    )
                  }}
                  onDelete={(noteId) => {
                    notes.setNotes((prev) =>
                      prev.filter((n) => n.id !== noteId)
                    )
                  }}
                />
              ))}
          </CardColumn>
          ))}

        </div>
      </div>

      {(notes.notes.length === 0 && categories.categories.length === 0)  && (
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
