import { create } from 'zustand'
import { isDemoMode } from '../lib/demo'
import { DEMO_NOTES } from '../lib/demoData'

export type NoteCategory = 'story' | 'character' | 'dialogue' | 'scene' | 'research' | 'producer'
export type NotePriority = 'critical' | 'high' | 'medium' | 'low'

export interface Note {
  id: string
  projectId: string
  blockId: string
  blockLabel: string
  content: string
  category: NoteCategory
  tags: string[]
  color: NoteCategory
  priority: NotePriority
  resolved: boolean
  createdAt: string
}

export const CATEGORY_COLORS: Record<NoteCategory, { bg: string; border: string; accent: string; text: string }> = {
  story:    { bg: '#C0443C20', border: '#C0443C66', accent: '#C0443C', text: '#9B3530' },
  character:{ bg: '#C46E2C20', border: '#C46E2C66', accent: '#C46E2C', text: '#9E5822' },
  dialogue: { bg: '#B08A0020', border: '#B08A0066', accent: '#B08A00', text: '#8A6A00' },
  scene:    { bg: '#3A7A5220', border: '#3A7A5266', accent: '#3A7A52', text: '#2E6040' },
  research: { bg: '#2D6EA820', border: '#2D6EA866', accent: '#2D6EA8', text: '#235580' },
  producer: { bg: '#6B4A9E20', border: '#6B4A9E66', accent: '#6B4A9E', text: '#553A7E' },
}

export const CATEGORY_LABELS: Record<NoteCategory, string> = {
  story:    'Story',
  character:'Character',
  dialogue: 'Dialogue',
  scene:    'Scene',
  research: 'Research',
  producer: 'Producer',
}

function demoNotesToStore(projectId: string): Note[] {
  return DEMO_NOTES.map((n) => ({
    id: n.id,
    projectId,
    blockId: '',
    blockLabel: n.sceneRef,
    content: n.text,
    category: n.category as NoteCategory,
    tags: [],
    color: n.color as NoteCategory,
    priority: n.priority as NotePriority,
    resolved: n.resolved,
    createdAt: n.createdAt,
  }))
}

interface NotesState {
  notes: Note[]
  selectedNoteId: string | null

  // Called by editor once mounted to resolve blockIds from scene text
  updateBlockIds: (getBlockId: (text: string) => string | undefined) => void

  setNotes: (notes: Note[]) => void
  selectNote: (id: string | null) => void
  resolveNote: (id: string) => void
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => void
}

export const useNotesStore = create<NotesState>((set) => ({
  notes: [],
  selectedNoteId: null,

  setNotes: (notes) => set({ notes }),

  updateBlockIds: (getBlockId) => {
    set((s) => ({
      notes: s.notes.map((n) => ({
        ...n,
        blockId: n.blockId || getBlockId(n.blockLabel) || '',
      })),
    }))
  },

  selectNote: (id) => set({ selectedNoteId: id }),

  resolveNote: (id) => {
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? { ...n, resolved: !n.resolved } : n)),
    }))
  },

  addNote: (partial) => {
    const id = `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const note: Note = { ...partial, id, createdAt: new Date().toISOString() }
    set((s) => ({ notes: [note, ...s.notes] }))
  },
}))

export function initNotesStore(projectId: string) {
  const store = useNotesStore.getState()
  if (isDemoMode) {
    store.setNotes(demoNotesToStore(projectId))
  }
}
