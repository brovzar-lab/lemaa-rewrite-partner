import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface Toast {
  id: string
  message: string
  type: 'info' | 'success' | 'error' | 'demo'
}

interface ToastContextValue {
  showToast: (message: string, type?: Toast['type']) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-slide-up px-4 py-3 rounded-card shadow-lg text-sm max-w-xs"
            style={{
              backgroundColor:
                toast.type === 'demo'
                  ? '#1A1916'
                  : toast.type === 'error'
                  ? '#C0443C'
                  : toast.type === 'success'
                  ? '#3A7A52'
                  : '#3D6B8E',
              color: '#FFFFFF',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {toast.type === 'demo' && <span className="mr-1.5 opacity-70">⚡</span>}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
