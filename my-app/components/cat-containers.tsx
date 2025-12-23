"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { GripVertical } from "lucide-react"
import { createClient } from "@/lib/client"

interface CardColumnProps {
  id: string
  title: string
  userId: string
  x: number
  y: number
  width?: number
  color?: string
  children: React.ReactNode
  registerRef?: (el: HTMLDivElement) => void
  onUpdatePosition: (id: string, x: number, y: number) => void
  onMoveNote: (noteId: string, categoryId: string) => void

}

export function CardColumn({
  id,
  title,
  userId,
  x,
  y,
  width = 320,
  color = "#94a3b8",
  children,
  registerRef,
  onUpdatePosition,
  onMoveNote
}: CardColumnProps) {
  const [pos, setPos] = useState({ x, y })
  const dragRef = useRef({ isDragging: false, offsetX: 0, offsetY: 0 })
  const supabase = createClient()

  // Keep pos in sync if props change (only when not dragging)
  useEffect(() => {
    if (!dragRef.current.isDragging) {
      setPos({ x, y })
    }
  }, [x, y])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    dragRef.current = {
      isDragging: true,
      offsetX: e.clientX - pos.x,
      offsetY: e.clientY - pos.y,
    }
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    document.body.style.userSelect = "none" // prevent text selection
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragRef.current.isDragging) return
    const newX = e.clientX - dragRef.current.offsetX
    const newY = e.clientY - dragRef.current.offsetY
    setPos({ x: newX, y: newY })
  }

  const handleMouseUp = async () => {
    if (!dragRef.current.isDragging) return
    dragRef.current.isDragging = false
    window.removeEventListener("mousemove", handleMouseMove)
    window.removeEventListener("mouseup", handleMouseUp)
    document.body.style.userSelect = ""

    // Use latest pos
    setPos((latestPos) => {
        // schedule parent update after render
        setTimeout(() => {
        onUpdatePosition(id, latestPos.x, latestPos.y)

        supabase
            .from("categories")
            .update({ position_x: latestPos.x, position_y: latestPos.y })
            .eq("id", id)
            .eq("user_id", userId)
        }, 0)

        return latestPos
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() // REQUIRED to allow dropping
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()

    const noteId = e.dataTransfer.getData("noteId")
    if (!noteId) return

    // update DB
    await supabase
        .from("notes")
        .update({ category: id })
        .eq("id", noteId)
        .eq("user_id", userId)

    // update local state
    onMoveNote(noteId, id)
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    // only left mouse OR touch
    

    if (e.pointerType === "mouse" && e.button !== 0) return

    e.preventDefault()

    dragRef.current = {
      isDragging: true,
      offsetX: e.clientX - pos.x,
      offsetY: e.clientY - pos.y,
    }

    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)

    document.body.style.userSelect = "none"
    document.body.style.overflow = "hidden"
  }

  const handlePointerMove = (e: PointerEvent) => {
    if (!dragRef.current.isDragging) return

    setPos({
      x: e.clientX - dragRef.current.offsetX,
      y: e.clientY - dragRef.current.offsetY,
    })
  }

  const handlePointerUp = async (e: PointerEvent) => {
    

    if (!dragRef.current.isDragging) return

    dragRef.current.isDragging = false

    window.removeEventListener("pointermove", handlePointerMove)
    window.removeEventListener("pointerup", handlePointerUp)

    document.body.style.userSelect = ""
    document.body.style.overflow = ""

    setPos((latestPos) => {
      setTimeout(() => {
        onUpdatePosition(id, latestPos.x, latestPos.y)

        supabase
          .from("categories")
          .update({
            position_x: latestPos.x,
            position_y: latestPos.y,
          })
          .eq("id", id)
          .eq("user_id", userId)
      }, 0)

      return latestPos
    })
  }



  return (
    <Card
      ref={registerRef}
      className="absolute select-none shadow-lg"
      style={{
        left: pos.x,
        top: pos.y,
        width,
        borderTopWidth: 4,
        borderTopColor: color,
      }}
    >
      <div
        className="flex items-center gap-2 p-3 cursor-grab active:cursor-grabbing border-b bg-muted/40 touch-none"
        onPointerDown={handlePointerDown}
        style={{ touchAction: "none" }}
      >
        <GripVertical className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="flex flex-col gap-3 p-3" onDragOver={handleDragOver} onDrop={handleDrop}>{children}</div>
    </Card>
  )
}
