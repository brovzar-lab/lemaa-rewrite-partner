import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './hooks/useToast'
import { isDemoMode } from './lib/demo'
import { AuthScreen } from './components/AuthScreen'
import Home from './pages/Home'
import Project from './pages/Project'
import { useState } from 'react'

function AppRoutes() {
  const [authed, setAuthed] = useState(isDemoMode)

  if (!authed) {
    return <AuthScreen onContinue={() => setAuthed(true)} />
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/project/:projectId" element={<Project />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  )
}
