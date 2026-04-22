import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { useEffect, useState } from 'react'
import { auth } from './firebase'
import { isDemoMode } from './demo'

const googleProvider = new GoogleAuthProvider()

export async function signIn(email: string, password: string) {
  if (!auth) throw new Error('Firebase not initialized')
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signInWithGoogle() {
  if (!auth) throw new Error('Firebase not initialized')
  return signInWithPopup(auth, googleProvider)
}

export async function signOut() {
  if (!auth) throw new Error('Firebase not initialized')
  return firebaseSignOut(auth)
}

export function useAuthState(): { user: User | null; loading: boolean } {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(!isDemoMode)

  useEffect(() => {
    if (isDemoMode || !auth) {
      setLoading(false)
      return
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  return { user, loading }
}
