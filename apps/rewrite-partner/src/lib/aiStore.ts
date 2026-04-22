import { create } from 'zustand'

export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

interface AIState {
  isOpen: boolean
  messages: AIMessage[]
  isStreaming: boolean
  pendingSuggestion: string | null

  open: () => void
  close: () => void
  toggle: () => void
  addUserMessage: (content: string) => string
  startAssistantMessage: () => string
  appendToMessage: (id: string, text: string) => void
  finalizeMessage: (id: string) => void
  setPendingSuggestion: (text: string | null) => void
  clearMessages: () => void
}

let nextId = 0
const uid = () => String(++nextId)

export const useAIStore = create<AIState>((set) => ({
  isOpen: false,
  messages: [],
  isStreaming: false,
  pendingSuggestion: null,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),

  addUserMessage: (content) => {
    const id = uid()
    set((s) => ({ messages: [...s.messages, { id, role: 'user', content }] }))
    return id
  },

  startAssistantMessage: () => {
    const id = uid()
    set((s) => ({
      isStreaming: true,
      messages: [...s.messages, { id, role: 'assistant', content: '', streaming: true }],
    }))
    return id
  },

  appendToMessage: (id, text) => {
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, content: m.content + text } : m
      ),
    }))
  },

  finalizeMessage: (id) => {
    set((s) => ({
      isStreaming: false,
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, streaming: false } : m
      ),
    }))
  },

  setPendingSuggestion: (text) => set({ pendingSuggestion: text }),
  clearMessages: () => set({ messages: [], pendingSuggestion: null }),
}))
