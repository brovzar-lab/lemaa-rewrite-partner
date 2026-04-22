import { isDemoMode } from '../lib/demo'
import { DemoBadge } from './DemoBadge'
import { FileText, LogIn } from 'lucide-react'

interface AuthScreenProps {
  onContinue: () => void
}

export function AuthScreen({ onContinue }: AuthScreenProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: '#F8F7F4' }}
    >
      <div className="flex flex-col items-center gap-6 mb-10">
        <div
          className="w-14 h-14 rounded-panel flex items-center justify-center"
          style={{ backgroundColor: '#3D6B8E' }}
        >
          <FileText className="w-7 h-7 text-white" />
        </div>
        <div className="text-center">
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ color: '#1A1916', fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Rewrite Partner
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: '#6B6860', fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Turn your rewrite pile into a calm, systematic process.
          </p>
        </div>
      </div>

      <div
        className="w-full max-w-sm rounded-panel p-6 flex flex-col gap-3"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E0DED9',
          boxShadow: '0 1px 4px rgba(26,25,22,0.06)',
        }}
      >
        {isDemoMode && (
          <>
            <button
              onClick={onContinue}
              className="w-full py-2.5 px-4 rounded-card text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              style={{
                backgroundColor: '#3D6B8E',
                color: '#FFFFFF',
                fontFamily: 'Inter, system-ui, sans-serif',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2d5270'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#3D6B8E'
              }}
            >
              <LogIn className="w-4 h-4" />
              Continue as Demo User
            </button>
            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: '#6B6860', fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              <div className="flex-1 h-px" style={{ backgroundColor: '#E0DED9' }} />
              <span>or</span>
              <div className="flex-1 h-px" style={{ backgroundColor: '#E0DED9' }} />
            </div>
          </>
        )}

        <button
          disabled={isDemoMode}
          className="w-full py-2.5 px-4 rounded-card text-sm font-medium transition-colors"
          style={{
            backgroundColor: isDemoMode ? '#F2F1EE' : '#3D6B8E',
            color: isDemoMode ? '#B0AEA9' : '#FFFFFF',
            border: `1px solid ${isDemoMode ? '#E0DED9' : 'transparent'}`,
            fontFamily: 'Inter, system-ui, sans-serif',
            cursor: isDemoMode ? 'not-allowed' : 'pointer',
          }}
          title={isDemoMode ? 'Sign-in not available in demo mode' : undefined}
        >
          Sign in with Google
        </button>

        <button
          disabled={isDemoMode}
          className="w-full py-2.5 px-4 rounded-card text-sm font-medium transition-colors"
          style={{
            backgroundColor: isDemoMode ? '#F2F1EE' : '#FFFFFF',
            color: isDemoMode ? '#B0AEA9' : '#1A1916',
            border: '1px solid #E0DED9',
            fontFamily: 'Inter, system-ui, sans-serif',
            cursor: isDemoMode ? 'not-allowed' : 'pointer',
          }}
          title={isDemoMode ? 'Sign-in not available in demo mode' : undefined}
        >
          Sign in with Email
        </button>
      </div>

      {isDemoMode && (
        <div className="mt-4">
          <DemoBadge />
        </div>
      )}

      <p
        className="mt-8 text-xs text-center max-w-xs"
        style={{ color: '#B0AEA9', fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        Your screenplay stays private. Notes are stored securely in your project.
      </p>
    </div>
  )
}
