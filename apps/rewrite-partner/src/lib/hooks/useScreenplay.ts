import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useRef, useCallback } from 'react'
import { db } from '../firebase'
import { isDemoMode } from '../demo'
import { DEMO_SCREENPLAY } from '../demoData'
import { useToastContext } from './useToastContext'

export interface Screenplay {
  fountainContent: string
  lastSavedAt: Date | null
}

function screenplayRef(uid: string, projectId: string) {
  return doc(db!, 'users', uid, 'screenplays', projectId)
}

export function useScreenplay(uid: string | null, projectId: string | null) {
  return useQuery<Screenplay>({
    queryKey: ['screenplay', uid, projectId],
    queryFn: async () => {
      if (isDemoMode || !uid || !projectId || !db) {
        return { fountainContent: DEMO_SCREENPLAY, lastSavedAt: null }
      }
      const snap = await getDoc(screenplayRef(uid, projectId))
      if (!snap.exists()) {
        return { fountainContent: '', lastSavedAt: null }
      }
      const data = snap.data()
      return {
        fountainContent: data.fountainContent as string,
        lastSavedAt: data.lastSavedAt?.toDate() ?? null,
      }
    },
    enabled: isDemoMode || (!!uid && !!projectId),
  })
}

export function useSaveScreenplay(uid: string | null, projectId: string | null) {
  const qc = useQueryClient()
  const { showToast } = useToastContext()
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const mutation = useMutation({
    mutationFn: async (fountainContent: string) => {
      if (isDemoMode || !uid || !projectId || !db) {
        showToast('Demo mode — not saved', 'demo')
        return
      }
      await setDoc(
        screenplayRef(uid, projectId),
        { fountainContent, lastSavedAt: serverTimestamp() },
        { merge: true },
      )
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['screenplay', uid, projectId] }),
  })

  const debouncedSave = useCallback(
    (content: string) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(() => mutation.mutate(content), 2000)
    },
    [mutation],
  )

  return { ...mutation, debouncedSave }
}
