import { create } from "zustand"

export interface Note {
  id: string
  user_id: string
  project_id: string
  category_id: string
  order_index: number
  content: string
}

export interface NotesStore {
  notes: Note[]
  setNotes: (notes: Note[]) => void
  addNotes: (notes: Note[]) => void
}

export const useNotesStore = create<NotesStore>((set) => ({
  notes: [],
  setNotes: (notes) => set({ notes }),
  addNotes: (newNotes) =>
    set((state) => ({ notes: [...state.notes, ...newNotes] })),
}))