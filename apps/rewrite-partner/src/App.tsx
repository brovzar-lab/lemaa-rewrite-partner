import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from './hooks/useToast'
import { isDemoMode } from './lib/demo'
import { useAuthState } from './lib/auth'
import { AuthScreen } from './components/AuthScreen'
import Home from './pages/Home'
import Project from './pages/Project'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5 },
  },
})

function AppRoutes() {
  const { user, loading } = useAuthState()

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F8F7F4' }}
      >
        <div
          className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#3D6B8E', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  if (!isDemoMode && !user) {
    return <AuthScreen onContinue={() => {}} />
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/project/:projectId"
        element={isDemoMode || user ? <Project /> : <Navigate to="/" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
