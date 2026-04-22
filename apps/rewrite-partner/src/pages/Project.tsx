import { useParams, useNavigate } from 'react-router-dom'
import { useRef, useState, useCallback, useEffect } from 'react'
import { isDemoMode } from '../lib/demo'
import { DemoBadge } from '../components/DemoBadge'
import { DEMO_SCREENPLAY } from '../lib/demoData'
import { useToast } from '../hooks/useToast'
import { ArrowLeft, ChevronRight, Upload } from 'lucide-react'
import { ScreenplayEditor, type Note as EditorNote } from '../editor/ScreenplayEditor'
import { NotesPanel } from '../components/notes/NotesPanel'
import { useNotesStore, initNotesStore } from '../stores/useNotesStore'
import { CATEGORY_COLORS } from '../stores/useNotesStore'
import type { NoteCategory } from '../stores/useNotesStore'
import { AIPartnerPanel } from '../components/AIPartnerPanel'

const PROJECT_TITLES: Record<string, string> = {
  demo: 'The Last Water (Draft 3)',
  'demo-2': 'Night Protocol (Spec)',
  'demo-3': 'Harbor View (Pilot Draft)',
  imported: 'Imported Script',
}

export default function Project() {
  const { projectId = 'demo' } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const projectFileInputRef = useRef<HTMLInputElement>(null)

  const notes = useNotesStore((s) => s.notes)
  const updateBlockIds = useNotesStore((s) => s.updateBlockIds)

  const importedScreenplay =
    projectId === 'imported'
      ? (sessionStorage.getItem('imported_screenplay') ?? DEMO_SCREENPLAY)
      : DEMO_SCREENPLAY
  const [screenplay, setScreenplay] = useState(importedScreenplay)
  const [highlightBlockId, setHighlightBlockId] = useState<string | undefined>()
  const [aiActiveNote, setAIActiveNote] = useState<{ id: string; content: string; blockLabel?: string } | null>(null)
  const [showEditHint, setShowEditHint] = useState(
    () => !localStorage.getItem('rp_edit_hint_dismissed')
  )

  useEffect(() => {
    initNotesStore(projectId)
  }, [projectId])

  const resolvedCount = notes.filter((n) => n.resolved).length
  const totalCount = notes.length
  const projectTitle = PROJECT_TITLES[projectId] ?? 'Script'

  const editorNotes: EditorNote[] = notes.map((n) => ({
    id: n.id,
    blockId: n.blockId,
    categoryColor: CATEGORY_COLORS[n.color as NoteCategory]?.accent ?? '#6B6860',
    content: n.content,
  }))

  const handleEditorReady = useCallback(
    (getBlockId: (text: string) => string | undefined) => {
      updateBlockIds(getBlockId)
    },
    [updateBlockIds],
  )

  function handleNoteSelect(blockId: string) {
    setHighlightBlockId(blockId)
  }

  function handleGutterNoteClick(noteId: string) {
    const note = notes.find((n) => n.id === noteId)
    if (note?.blockId) setHighlightBlockId(note.blockId)
    useNotesStore.getState().selectNote(noteId)
  }

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
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.borderColor = '#B8D4E8'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.borderColor = '#E0DED9'
          }}
        >
          <Upload className="w-3 h-3" />
          Import script
        </button>
        {isDemoMode && <DemoBadge />}
      </header>

      {showEditHint && (
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: '#EBF2F8',
            borderBottom: '1px solid #B8D4E8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 13,
            color: '#3D6B8E',
          }}
        >
          <span>✏️ This screenplay is fully editable — click anywhere to start typing or import your own script</span>
          <button
            onClick={() => {
              setShowEditHint(false)
              localStorage.setItem('rp_edit_hint_dismissed', '1')
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3D6B8E', fontSize: 16 }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 49px)' }}>
        <NotesPanel
          onNoteSelect={handleNoteSelect}
          onAskAI={(noteId, content) => {
            const note = notes.find((n) => n.id === noteId)
            setAIActiveNote({ id: noteId, content, blockLabel: note?.blockLabel })
          }}
        />

        <main style={{ flex: 1, minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <ScreenplayEditor
            content={screenplay}
            notes={editorNotes}
            onContentChange={(fountain) => {
              setScreenplay(fountain)
              if (isDemoMode) showToast('Demo mode — not saved', 'demo')
            }}
            onNoteClick={handleGutterNoteClick}
            highlightBlockId={highlightBlockId}
            onEditorReady={handleEditorReady}
          />
        </main>

        <AIPartnerPanel
          screenplay={screenplay}
          notes={notes}
          activeNote={aiActiveNote}
          onActiveNoteClear={() => setAIActiveNote(null)}
        />
      </div>
    </div>
  )
}
