import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { isDemoMode } from '../demo'
import { DEMO_NOTES } from '../demoData'
import { useToastContext } from './useToastContext'

export interface Note {
  id: string
  projectId: string
  blockId?: string
  content: string
  tags: string[]
  color: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  resolved: boolean
  createdAt: Date
}

function notesRef(uid: string) {
  return collection(db!, 'users', uid, 'notes')
}

export function useNotes(uid: string | null, projectId: string | null) {
  return useQuery<Note[]>({
    queryKey: ['notes', uid, projectId],
    queryFn: async () => {
      if (isDemoMode || !uid || !projectId || !db) {
        return DEMO_NOTES.map((n) => ({
          id: n.id,
          projectId: 'demo',
          content: n.text,
          tags: [n.category],
          color: n.color,
          priority: n.priority,
          resolved: n.resolved,
          createdAt: new Date(n.createdAt),
        }))
      }
      const q = query(notesRef(uid), where('projectId', '==', projectId))
      const snap = await getDocs(q)
      return snap.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          projectId: data.projectId as string,
          blockId: data.blockId as string | undefined,
          content: data.content as string,
          tags: (data.tags as string[]) ?? [],
          color: data.color as string,
          priority: data.priority as Note['priority'],
          resolved: data.resolved as boolean,
          createdAt: data.createdAt?.toDate() ?? new Date(),
        }
      })
    },
    enabled: isDemoMode || (!!uid && !!projectId),
  })
}

export function useCreateNote(uid: string | null) {
  const qc = useQueryClient()
  const { showToast } = useToastContext()

  return useMutation({
    mutationFn: async (note: Omit<Note, 'id' | 'createdAt'>) => {
      if (isDemoMode || !uid || !db) {
        showToast('Demo mode — not saved', 'demo')
        return
      }
      await addDoc(notesRef(uid), { ...note, createdAt: serverTimestamp() })
    },
    onSuccess: (_data, note) =>
      qc.invalidateQueries({ queryKey: ['notes', uid, note.projectId] }),
  })
}

export function useUpdateNote(uid: string | null) {
  const qc = useQueryClient()
  const { showToast } = useToastContext()

  return useMutation({
    mutationFn: async ({
      noteId,
      projectId,
      changes,
    }: {
      noteId: string
      projectId: string
      changes: Partial<Note>
    }) => {
      if (isDemoMode || !uid || !db) {
        showToast('Demo mode — not saved', 'demo')
        return { noteId, projectId, changes }
      }
      await updateDoc(doc(db, 'users', uid, 'notes', noteId), changes)
      return { noteId, projectId, changes }
    },
    onMutate: async ({ noteId, projectId, changes }) => {
      await qc.cancelQueries({ queryKey: ['notes', uid, projectId] })
      const prev = qc.getQueryData<Note[]>(['notes', uid, projectId])
      qc.setQueryData<Note[]>(['notes', uid, projectId], (old) =>
        old?.map((n) => (n.id === noteId ? { ...n, ...changes } : n)),
      )
      return { prev, projectId }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(['notes', uid, ctx.projectId], ctx.prev)
      }
    },
    onSettled: (_data, _err, { projectId }) =>
      qc.invalidateQueries({ queryKey: ['notes', uid, projectId] }),
  })
}

export function useDeleteNote(uid: string | null) {
  const qc = useQueryClient()
  const { showToast } = useToastContext()

  return useMutation({
    mutationFn: async ({ noteId, projectId }: { noteId: string; projectId: string }) => {
      if (isDemoMode || !uid || !db) {
        showToast('Demo mode — not saved', 'demo')
        return { projectId }
      }
      await deleteDoc(doc(db, 'users', uid, 'notes', noteId))
      return { projectId }
    },
    onSuccess: (result) =>
      qc.invalidateQueries({ queryKey: ['notes', uid, result?.projectId] }),
  })
}
