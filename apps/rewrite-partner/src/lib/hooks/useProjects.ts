import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { isDemoMode } from '../demo'
import { DEMO_PROJECTS } from '../demoData'
import { useToastContext } from './useToastContext'

export interface Project {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
}

function projectsRef(uid: string) {
  return collection(db!, 'users', uid, 'projects')
}

export function useProjects(uid: string | null) {
  return useQuery<Project[]>({
    queryKey: ['projects', uid],
    queryFn: async () => {
      if (isDemoMode || !uid || !db) {
        return DEMO_PROJECTS.map((p) => ({
          id: p.id,
          title: p.title,
          createdAt: new Date(p.lastModified),
          updatedAt: new Date(p.lastModified),
        }))
      }
      const snap = await getDocs(projectsRef(uid))
      return snap.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          title: data.title as string,
          createdAt: data.createdAt?.toDate() ?? new Date(),
          updatedAt: data.updatedAt?.toDate() ?? new Date(),
        }
      })
    },
    enabled: isDemoMode || !!uid,
  })
}

export function useCreateProject(uid: string | null) {
  const qc = useQueryClient()
  const { showToast } = useToastContext()

  return useMutation({
    mutationFn: async (title: string) => {
      if (isDemoMode || !uid || !db) {
        showToast('Demo mode — not saved', 'demo')
        return
      }
      await addDoc(projectsRef(uid), {
        title,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects', uid] }),
  })
}

export function useDeleteProject(uid: string | null) {
  const qc = useQueryClient()
  const { showToast } = useToastContext()

  return useMutation({
    mutationFn: async (projectId: string) => {
      if (isDemoMode || !uid || !db) {
        showToast('Demo mode — not saved', 'demo')
        return
      }
      await deleteDoc(doc(db, 'users', uid, 'projects', projectId))
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects', uid] }),
  })
}
