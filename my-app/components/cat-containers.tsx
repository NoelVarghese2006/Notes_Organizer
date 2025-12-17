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
  onUpdatePosition: (id: string, x: number, y: number) => void
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
  onUpdatePosition,
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

    // Persist position to parent + DB
    onUpdatePosition(id, pos.x, pos.y)
    await supabase
      .from("categories")
      .update({ position_x: pos.x, position_y: pos.y })
      .eq("id", id)
      .eq("user_id", userId)
  }

  return (
    <Card
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
        className="flex items-center gap-2 p-3 cursor-grab active:cursor-grabbing border-b bg-muted/40"
        onMouseDown={handleMouseDown}
      >
        <GripVertical className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="flex flex-col gap-3 p-3">{children}</div>
    </Card>
  )
}
