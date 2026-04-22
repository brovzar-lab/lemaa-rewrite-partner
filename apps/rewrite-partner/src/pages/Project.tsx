import { useParams, useNavigate } from 'react-router-dom'
import { useRef, useState } from 'react'
import { isDemoMode } from '../lib/demo'
import { DemoBadge } from '../components/DemoBadge'
import { DEMO_NOTES, DEMO_SCREENPLAY, type DemoNote } from '../lib/demoData'
import { useToast } from '../hooks/useToast'
import { ArrowLeft, FileText, CheckCircle2, Circle, ChevronRight, Upload } from 'lucide-react'

const CATEGORY_COLORS: Record<DemoNote['color'], { bg: string; border: string; text: string }> = {
  story: { bg: '#FDF0EF', border: '#E8A5A0', text: '#C0443C' },
  character: { bg: '#FEF4EC', border: '#E8BE8C', text: '#C46E2C' },
  dialogue: { bg: '#FFFBE6', border: '#DDD080', text: '#8A6A00' },
  scene: { bg: '#EEF7F2', border: '#8DC8A4', text: '#3A7A52' },
  research: { bg: '#EDF4FB', border: '#80B4DC', text: '#2D6EA8' },
  producer: { bg: '#F4EFF9', border: '#B090D0', text: '#6B4A9E' },
}

const CATEGORY_LABELS: Record<DemoNote['category'], string> = {
  story: 'Story / Structure',
  character: 'Character',
  dialogue: 'Dialogue',
}

function NoteCard({ note, onResolve }: { note: DemoNote; onResolve: (id: string) => void }) {
  const colors = CATEGORY_COLORS[note.color]

  return (
    <div
      className="rounded-card p-3 transition-all"
      style={{
        backgroundColor: note.resolved ? '#F2F1EE' : colors.bg,
        border: `1px solid ${note.resolved ? '#E0DED9' : colors.border}`,
        opacity: note.resolved ? 0.7 : 1,
      }}
    >
      <div className="flex items-start gap-2 mb-2">
        <button
          onClick={() => onResolve(note.id)}
          className="flex-shrink-0 mt-0.5 transition-opacity hover:opacity-70"
          title={note.resolved ? 'Mark unresolved' : 'Mark resolved'}
        >
          {note.resolved ? (
            <CheckCircle2 className="w-4 h-4" style={{ color: '#3A7A52' }} />
          ) : (
            <Circle className="w-4 h-4" style={{ color: colors.text }} />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span
              className="text-xs font-medium px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: colors.bg,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              {CATEGORY_LABELS[note.category]}
            </span>
            {note.priority === 'critical' && (
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: '#C0443C', color: '#FFFFFF', fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                Critical
              </span>
            )}
            {note.priority === 'high' && (
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: '#C46E2C', color: '#FFFFFF', fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                High
              </span>
            )}
            {note.priority === 'low' && (
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'transparent',
                  color: '#3D6B8E',
                  border: '1px solid #3D6B8E',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                Low
              </span>
            )}
          </div>
          <p
            className="text-xs leading-relaxed"
            style={{
              color: note.resolved ? '#B0AEA9' : '#1A1916',
              fontFamily: 'Inter, system-ui, sans-serif',
              textDecoration: note.resolved ? 'line-through' : 'none',
            }}
          >
            {note.text.length > 140 ? note.text.slice(0, 140) + '…' : note.text}
          </p>
          <p
            className="text-xs mt-1.5"
            style={{ color: '#B0AEA9', fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            {note.sceneRef} · {note.source}
          </p>
        </div>
      </div>
    </div>
  )
}

function ScreenplayViewer({ text }: { text: string }) {
  const lines = text.split('\n')

  return (
    <div className="h-full overflow-y-auto p-8" style={{ backgroundColor: '#FFFFFF' }}>
      <div
        className="max-w-xl mx-auto"
        style={{
          fontFamily: '"Courier Prime", Courier, monospace',
          fontSize: '12pt',
          lineHeight: '1.6',
          color: '#1A1916',
        }}
      >
        {lines.map((line, i) => {
          const trimmed = line.trim()
          const isSlugline =
            trimmed.startsWith('INT.') ||
            trimmed.startsWith('EXT.') ||
            trimmed.startsWith('SMASH CUT')
          const isCharacter =
            trimmed.length > 0 &&
            trimmed === trimmed.toUpperCase() &&
            !isSlugline &&
            !trimmed.startsWith('(') &&
            trimmed.length < 40
          const isDialogue = line.startsWith('          ')

          return (
            <div
              key={i}
              style={{
                fontWeight: isSlugline ? 700 : 400,
                marginTop: isSlugline ? '1.5em' : 0,
                marginBottom: isSlugline ? '0.5em' : 0,
                paddingLeft: isDialogue ? '2.5em' : isCharacter ? '3.7em' : 0,
              }}
            >
              {line || ' '}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const PROJECT_TITLES: Record<string, string> = {
  demo: 'The Last Water (Draft 3)',
  'demo-2': 'Night Protocol (Spec)',
  'demo-3': 'Harbor View (Pilot Draft)',
  imported: 'Imported Script',
}

export default function Project() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [notes, setNotes] = useState<DemoNote[]>(DEMO_NOTES)
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('active')
  const projectFileInputRef = useRef<HTMLInputElement>(null)

  const importedScreenplay =
    projectId === 'imported'
      ? (sessionStorage.getItem('imported_screenplay') ?? DEMO_SCREENPLAY)
      : DEMO_SCREENPLAY
  const [screenplay, setScreenplay] = useState(importedScreenplay)

  async function handleProjectFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    let fountain: string
    if (file.name.endsWith('.fdx')) {
      const { fdxToFountain } = await import('../lib/converter')
      fountain = fdxToFountain(text)
    } else {
      fountain = text
    }
    setScreenplay(fountain)
    sessionStorage.setItem('imported_screenplay', fountain)
    if (isDemoMode) showToast("Demo mode — edits won't be saved", 'demo')
    e.target.value = ''
  }

  function handleResolve(id: string) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, resolved: !n.resolved } : n)))
    if (isDemoMode) showToast('Demo mode — not saved', 'demo')
  }

  const resolvedCount = notes.filter((n) => n.resolved).length
  const totalCount = notes.length

  const filteredNotes = notes.filter((n) => {
    if (filter === 'active') return !n.resolved
    if (filter === 'resolved') return n.resolved
    return true
  })

  const projectTitle = PROJECT_TITLES[projectId ?? ''] ?? 'Script'

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F7F4' }}>
      <header
        className="sticky top-0 z-10 px-4 py-2.5 flex items-center gap-3"
        style={{
          backgroundColor: 'rgba(248,247,244,0.94)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #E0DED9',
        }}
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-sm hover:opacity-70 transition-opacity"
          style={{
            color: '#6B6860',
            fontFamily: 'Inter, system-ui, sans-serif',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <ChevronRight className="w-3.5 h-3.5" style={{ color: '#B0AEA9' }} />
        <span
          className="font-medium text-sm truncate flex-1"
          style={{ color: '#1A1916', fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          {projectTitle}
        </span>
        <span
          className="text-xs flex-shrink-0"
          style={{ color: '#6B6860', fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          {resolvedCount} of {totalCount} notes resolved
        </span>
        <input
          ref={projectFileInputRef}
          type="file"
          accept=".fdx,.fountain"
          style={{ display: 'none' }}
          onChange={handleProjectFileChange}
        />
        <button
          onClick={() => projectFileInputRef.current?.click()}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-card transition-colors flex-shrink-0"
          style={{
            backgroundColor: '#FFFFFF',
            color: '#6B6860',
            border: '1px solid #E0DED9',
            fontFamily: 'Inter, system-ui, sans-serif',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#B8D4E8' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#E0DED9' }}
        >
          <Upload className="w-3 h-3" />
          Import script
        </button>
        {isDemoMode && <DemoBadge />}
      </header>

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 49px)' }}>
        {/* Notes panel */}
        <aside
          className="flex-shrink-0 flex flex-col overflow-hidden"
          style={{ width: '300px', borderRight: '1px solid #E0DED9', backgroundColor: '#F8F7F4' }}
        >
          <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid #E0DED9' }}>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-3.5 h-3.5" style={{ color: '#6B6860' }} />
              <span
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: '#6B6860', fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                Notes
              </span>
            </div>
            <div className="flex gap-1">
              {(['active', 'all', 'resolved'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-2 py-0.5 rounded text-xs capitalize transition-colors"
                  style={{
                    backgroundColor: filter === f ? '#3D6B8E' : 'transparent',
                    color: filter === f ? '#FFFFFF' : '#6B6860',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    border: `1px solid ${filter === f ? '#3D6B8E' : '#E0DED9'}`,
                    cursor: 'pointer',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {filteredNotes.length === 0 ? (
              <div
                className="text-center py-8 text-sm"
                style={{ color: '#B0AEA9', fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                {filter === 'resolved' ? 'No resolved notes yet' : 'All notes resolved!'}
              </div>
            ) : (
              filteredNotes.map((note) => (
                <NoteCard key={note.id} note={note} onResolve={handleResolve} />
              ))
            )}
          </div>
        </aside>

        {/* Script viewer */}
        <main className="flex-1 overflow-hidden">
          <ScreenplayViewer text={screenplay} />
        </main>

        {/* AI Partner strip (collapsed) */}
        <aside
          className="flex-shrink-0 flex flex-col items-center justify-between py-6 px-3"
          style={{ width: '48px', borderLeft: '1px solid #E0DED9', backgroundColor: '#F8F7F4' }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center animate-pulse-soft"
            style={{ backgroundColor: '#EBF2F8' }}
            title="AI Partner — coming soon"
          >
            <span style={{ fontSize: '12px' }}>✦</span>
          </div>
          <span
            className="text-xs select-none"
            style={{
              color: '#B0AEA9',
              fontFamily: 'Inter, system-ui, sans-serif',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)',
              letterSpacing: '0.05em',
            }}
          >
            AI Partner
          </span>
        </aside>
      </div>
    </div>
  )
}
