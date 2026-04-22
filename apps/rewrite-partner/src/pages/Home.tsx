import { useNavigate } from 'react-router-dom'
import { isDemoMode } from '../lib/demo'
import { DemoBadge } from '../components/DemoBadge'
import { DEMO_PROJECTS } from '../lib/demoData'
import { useToast } from '../hooks/useToast'
import { FileText, Upload, Plus, CheckCircle2, Circle, FileClock } from 'lucide-react'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function NoteProgress({ resolved, total }: { resolved: number; total: number }) {
  const pct = total === 0 ? 100 : Math.round((resolved / total) * 100)
  const allDone = resolved === total

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#E0DED9' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: allDone ? '#3A7A52' : '#3D6B8E' }}
        />
      </div>
      <span
        className="text-xs tabular-nums"
        style={{
          color: allDone ? '#3A7A52' : '#6B6860',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {resolved}/{total}
      </span>
    </div>
  )
}

function ProjectCard({
  project,
  onClick,
}: {
  project: (typeof DEMO_PROJECTS)[0]
  onClick: () => void
}) {
  const allDone = project.resolvedCount === project.noteCount

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-panel p-5 transition-all"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E0DED9',
        boxShadow: '0 1px 3px rgba(26,25,22,0.05)',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.boxShadow = '0 2px 8px rgba(26,25,22,0.10)'
        el.style.borderColor = '#B8D4E8'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.boxShadow = '0 1px 3px rgba(26,25,22,0.05)'
        el.style.borderColor = '#E0DED9'
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-card flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#EBF2F8' }}
          >
            {allDone ? (
              <CheckCircle2 className="w-4 h-4" style={{ color: '#3A7A52' }} />
            ) : (
              <FileText className="w-4 h-4" style={{ color: '#3D6B8E' }} />
            )}
          </div>
          <h3
            className="font-medium text-sm leading-snug"
            style={{ color: '#1A1916', fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            {project.title}
          </h3>
        </div>
        {allDone && (
          <span
            className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: '#E8F4ED',
              color: '#3A7A52',
              border: '1px solid #B5D9C4',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            Complete
          </span>
        )}
      </div>

      <NoteProgress resolved={project.resolvedCount} total={project.noteCount} />

      <div
        className="flex items-center gap-3 mt-3 text-xs"
        style={{ color: '#6B6860', fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        <span className="flex items-center gap-1">
          <FileClock className="w-3 h-3" />
          {formatDate(project.lastModified)}
        </span>
        <span className="flex items-center gap-1">
          <Circle className="w-3 h-3" />
          {project.pageCount} pages
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          {project.noteCount - project.resolvedCount} remaining
        </span>
      </div>
    </button>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  function handleImportFdx() {
    if (isDemoMode) {
      navigate('/project/demo')
      return
    }
    showToast('FDX import coming soon', 'info')
  }

  function handleNewScript() {
    if (isDemoMode) {
      showToast('Demo mode — not saved', 'demo')
      return
    }
    showToast('New script coming soon', 'info')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F7F4' }}>
      <header
        className="sticky top-0 z-10 px-6 py-3 flex items-center justify-between"
        style={{
          backgroundColor: 'rgba(248,247,244,0.92)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #E0DED9',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-card flex items-center justify-center"
            style={{ backgroundColor: '#3D6B8E' }}
          >
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span
            className="font-semibold text-sm"
            style={{ color: '#1A1916', fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Rewrite Partner
          </span>
          {isDemoMode && <DemoBadge />}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className="text-lg font-semibold"
              style={{ color: '#1A1916', fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              Your Scripts
            </h2>
            <p
              className="text-sm mt-0.5"
              style={{ color: '#6B6860', fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              {isDemoMode
                ? 'Demo projects — sign in to create your own'
                : 'All your rewrite projects in one place'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleImportFdx}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-card text-sm font-medium transition-colors"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#1A1916',
                border: '1px solid #E0DED9',
                fontFamily: 'Inter, system-ui, sans-serif',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.borderColor = '#B8D4E8'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.borderColor = '#E0DED9'
              }}
            >
              <Upload className="w-3.5 h-3.5" />
              Import FDX
            </button>
            <div className="relative group">
              <button
                onClick={handleNewScript}
                disabled={isDemoMode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-card text-sm font-medium"
                style={{
                  backgroundColor: isDemoMode ? '#E0DED9' : '#3D6B8E',
                  color: isDemoMode ? '#B0AEA9' : '#FFFFFF',
                  border: 'none',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  cursor: isDemoMode ? 'not-allowed' : 'pointer',
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                New Script
              </button>
              {isDemoMode && (
                <div
                  className="absolute top-full right-0 mt-1.5 px-2.5 py-1.5 rounded-card text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                  style={{
                    backgroundColor: '#1A1916',
                    color: '#FFFFFF',
                    fontFamily: 'Inter, system-ui, sans-serif',
                  }}
                >
                  Sign in to create projects
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {DEMO_PROJECTS.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => navigate(`/project/${project.id}`)}
            />
          ))}
        </div>

        {isDemoMode && (
          <p
            className="text-xs text-center mt-8"
            style={{ color: '#B0AEA9', fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            These are sample projects. Sign in to import your own scripts and notes.
          </p>
        )}
      </main>
    </div>
  )
}
