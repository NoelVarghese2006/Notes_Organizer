import { create } from "zustand"

export interface Note {
  id: string
  user_id: string
  project_id: string
  category_id: string
  order_index: number
  content: string
  width: number
  height: number
  created_at: string

}

export interface NotesStore {
  notes: Note[]
  setNotes: (notes: Note[] | ((prev: Note[]) => Note[])) => void
  addNotes: (notes: Note[]) => void
}

export const useNotesStore = create<NotesStore>((set) => ({
  notes: [],
  setNotes: (notesOrUpdater) =>
    set((state) => ({
      notes:
        typeof notesOrUpdater === "function"
          ? notesOrUpdater(state.notes)
          : notesOrUpdater,
    })),
  addNotes: (newNotes) =>
    set((state) => ({ notes: [...state.notes, ...newNotes] })),
}))

export interface Category {
  id: string
  user_id: string
  project_id: string
  name: string
  color: string
  position_x: number
  position_y: number
  created_at: string
}

export interface CategoriesStore {
  categories: Category[]
  setCategories: (
    categories: Category[] | ((prev: Category[]) => Category[])
  ) => void
  addCategories: (categories: Category[]) => void
  getById: (id: string) => Category | undefined
  getByName: (name: string) => Category | undefined
}

export const useCategoriesStore = create<CategoriesStore>((set, get) => ({
  categories: [],

  setCategories: (categoriesOrUpdater) =>
    set((state) => ({
      categories:
        typeof categoriesOrUpdater === "function"
          ? categoriesOrUpdater(state.categories)
          : categoriesOrUpdater,
    })),

  addCategories: (newCategories) =>
    set((state) => ({
      categories: [...state.categories, ...newCategories],
    })),

  // convenience helpers (optional but useful)
  getById: (id) => get().categories.find((c) => c.id === id),
  getByName: (name) =>
    get().categories.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    ),
}))