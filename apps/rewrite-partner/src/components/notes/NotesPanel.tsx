import { useState, useRef } from 'react'
import { useNotesStore } from '../../stores/useNotesStore'
import type { NoteCategory, NotePriority } from '../../stores/useNotesStore'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../stores/useNotesStore'
import { NoteCard } from './NoteCard'
import { NoteDetailDrawer } from './NoteDetailDrawer'
import type { Note } from '../../stores/useNotesStore'

const ALL_CATEGORIES: NoteCategory[] = ['story', 'character', 'dialogue', 'scene', 'research', 'producer']
const ALL_PRIORITIES: (NotePriority | 'all')[] = ['all', 'critical', 'high', 'medium', 'low']

interface Props {
  /** Called when a note card is clicked — tells workspace to scroll editor to blockId */
  onNoteSelect: (blockId: string) => void
  /** Called when Ask AI is triggered from the detail drawer */
  onAskAI: (noteId: string, content: string) => void
}

export function NotesPanel({ onNoteSelect, onAskAI }: Props) {
  const { notes, selectedNoteId, selectNote, resolveNote } = useNotesStore()
  const listRef = useRef<HTMLDivElement>(null)

  const [categoryFilter, setCategoryFilter] = useState<NoteCategory[]>([])
  const [priorityFilter, setPriorityFilter] = useState<NotePriority | 'all'>('all')
  const [showResolved, setShowResolved] = useState(false)

  const resolvedCount = notes.filter((n) => n.resolved).length
  const totalCount = notes.length

  const filtered = notes.filter((n) => {
    if (!showResolved && n.resolved) return false
    if (categoryFilter.length > 0 && !categoryFilter.includes(n.color as NoteCategory)) return false
    if (priorityFilter !== 'all' && n.priority !== priorityFilter) return false
    return true
  })

  const selectedNote = selectedNoteId ? (notes.find((n) => n.id === selectedNoteId) ?? null) : null

  function handleNoteClick(noteId: string) {
    const note = notes.find((n) => n.id === noteId)
    if (!note) return
    selectNote(noteId)
    if (note.blockId) onNoteSelect(note.blockId)
  }

  function toggleCategory(cat: NoteCategory) {
    setCategoryFilter((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    )
  }

  function handleAskAI(note: Note) {
    onAskAI(note.id, note.content)
  }

  return (
    <>
      <div
        style={{
          width: '300px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRight: '1px solid #E0DED9',
          backgroundColor: '#F8F7F4',
        }}
      >
        {/* Sticky header */}
        <div
          style={{
            padding: '12px 14px 10px',
            borderBottom: '1px solid #E0DED9',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#1A1916',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              Notes
            </span>
            {/* Count badge */}
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'Inter, system-ui, sans-serif',
                color: '#6B6860',
                backgroundColor: '#F2F1EE',
                border: '1px solid #E0DED9',
                borderRadius: '10px',
                padding: '1px 7px',
              }}
            >
              {resolvedCount} / {totalCount} resolved
            </span>
          </div>

          {/* Category color chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
            {ALL_CATEGORIES.map((cat) => {
              const c = CATEGORY_COLORS[cat]
              const active = categoryFilter.includes(cat)
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 7px',
                    borderRadius: '10px',
                    border: `1px solid ${active ? c.accent : '#E0DED9'}`,
                    backgroundColor: active ? c.bg : 'transparent',
                    color: active ? c.accent : '#9D9B96',
                    fontSize: '10px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    cursor: 'pointer',
                    fontWeight: active ? 600 : 400,
                    transition: 'all 0.1s',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: active ? c.accent : '#D5D3CE',
                      flexShrink: 0,
                    }}
                  />
                  {CATEGORY_LABELS[cat]}
                </button>
              )
            })}
          </div>

          {/* Priority filter + resolved toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', gap: '3px' }}>
              {ALL_PRIORITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p as NotePriority | 'all')}
                  style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: `1px solid ${priorityFilter === p ? '#6B6860' : '#E0DED9'}`,
                    backgroundColor: priorityFilter === p ? '#E8E6E1' : 'transparent',
                    color: priorityFilter === p ? '#1A1916' : '#9D9B96',
                    fontSize: '10px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowResolved((v) => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                padding: '2px 6px',
                borderRadius: '4px',
                border: `1px solid ${showResolved ? '#3A7A52' : '#E0DED9'}`,
                backgroundColor: showResolved ? '#EEF7F2' : 'transparent',
                color: showResolved ? '#3A7A52' : '#9D9B96',
                fontSize: '10px',
                fontFamily: 'Inter, system-ui, sans-serif',
                cursor: 'pointer',
              }}
            >
              ✓ Resolved
            </button>
          </div>
        </div>

        {/* Note list — scrollable, max 3 notes (~96px each) visible before scroll */}
        <div
          ref={listRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '10px 10px 4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            minHeight: 0,
          }}
        >
          {filtered.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '32px 16px',
                fontSize: '12px',
                color: '#B0AEA9',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              {notes.length === 0 ? 'No notes yet' : 'No notes match filters'}
            </div>
          ) : (
            filtered.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                isSelected={selectedNoteId === note.id}
                onClick={() => handleNoteClick(note.id)}
                onResolve={() => resolveNote(note.id)}
              />
            ))
          )}
        </div>

        {/* Add Note button */}
        <div
          style={{
            padding: '10px',
            borderTop: '1px solid #E0DED9',
            flexShrink: 0,
          }}
        >
          <button
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: '1px dashed #D5D3CE',
              backgroundColor: 'transparent',
              color: '#9D9B96',
              fontSize: '12px',
              fontFamily: 'Inter, system-ui, sans-serif',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              transition: 'color 0.1s, border-color 0.1s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#1A1916'
              e.currentTarget.style.borderColor = '#6B6860'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#9D9B96'
              e.currentTarget.style.borderColor = '#D5D3CE'
            }}
          >
            + Add Note
          </button>
        </div>
      </div>

      {/* Detail drawer — slides over AI panel */}
      <NoteDetailDrawer
        note={selectedNote}
        onClose={() => selectNote(null)}
        onResolve={resolveNote}
        onAskAI={handleAskAI}
      />
    </>
  )
}
