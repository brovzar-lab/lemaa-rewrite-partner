import { useParams, useNavigate } from 'react-router-dom'
import { useState, useCallback, useEffect } from 'react'
import { isDemoMode } from '../lib/demo'
import { DemoBadge } from '../components/DemoBadge'
import { DEMO_SCREENPLAY } from '../lib/demoData'
import { useToast } from '../hooks/useToast'
import { ArrowLeft, ChevronRight } from 'lucide-react'
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
}

export default function Project() {
  const { projectId = 'demo' } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const notes = useNotesStore((s) => s.notes)
  const updateBlockIds = useNotesStore((s) => s.updateBlockIds)

  const [screenplay, setScreenplay] = useState(DEMO_SCREENPLAY)
  const [highlightBlockId, setHighlightBlockId] = useState<string | undefined>()
  const [aiActiveNote, setAIActiveNote] = useState<{ id: string; content: string; blockLabel?: string } | null>(null)

  // Seed the store with demo data when the project loads
  useEffect(() => {
    initNotesStore(projectId)
  }, [projectId])

  const resolvedCount = notes.filter((n) => n.resolved).length
  const totalCount = notes.length
  const projectTitle = PROJECT_TITLES[projectId] ?? 'Script'

  // Build editor-compatible notes from the store
  const editorNotes: EditorNote[] = notes.map((n) => ({
    id: n.id,
    blockId: n.blockId,
    categoryColor: CATEGORY_COLORS[n.color as NoteCategory]?.accent ?? '#6B6860',
    content: n.content,
  }))

  // When editor mounts, resolve blockIds for all store notes
  const handleEditorReady = useCallback(
    (getBlockId: (text: string) => string | undefined) => {
      updateBlockIds(getBlockId)
    },
    [updateBlockIds],
  )

  // Note panel click → scroll editor to block
  function handleNoteSelect(blockId: string) {
    setHighlightBlockId(blockId)
  }

  // Gutter click → select note in panel (it will scroll into view next render)
  function handleGutterNoteClick(noteId: string) {
    const note = notes.find((n) => n.id === noteId)
    if (note?.blockId) setHighlightBlockId(note.blockId)
    useNotesStore.getState().selectNote(noteId)
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
        {isDemoMode && <DemoBadge />}
      </header>

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 49px)' }}>
        {/* Notes panel (left, 300px) + Note detail drawer (rendered inside NotesPanel, z:50) */}
        <NotesPanel
          onNoteSelect={handleNoteSelect}
          onAskAI={(noteId, content) => {
            const note = notes.find((n) => n.id === noteId)
            setAIActiveNote({ id: noteId, content, blockLabel: note?.blockLabel })
          }}
        />

        {/* Screenplay editor */}
        <main className="flex-1 overflow-hidden">
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
