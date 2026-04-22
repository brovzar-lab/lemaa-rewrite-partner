import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'
import { isDemoMode } from './demo'

export async function uploadFdxFile(uid: string, projectId: string, file: File): Promise<string> {
  if (isDemoMode || !storage) {
    throw new Error('Storage not available in demo mode')
  }
  const storageRef = ref(storage, `users/${uid}/projects/${projectId}/original.fdx`)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}
