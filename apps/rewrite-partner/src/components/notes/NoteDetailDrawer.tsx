import { useEffect } from 'react'
import type { Note, NoteCategory } from '../../stores/useNotesStore'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../stores/useNotesStore'

const PRIORITY_LABELS: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

interface Props {
  note: Note | null
  onClose: () => void
  onResolve: (id: string) => void
  onAskAI: (note: Note) => void
}

export function NoteDetailDrawer({ note, onClose, onResolve, onAskAI }: Props) {
  useEffect(() => {
    if (!note) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [note, onClose])

  if (!note) return null

  const colors = CATEGORY_COLORS[note.color as NoteCategory] ?? CATEGORY_COLORS.story

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 40,
          backgroundColor: 'rgba(26,25,22,0.3)',
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '360px',
          zIndex: 50,
          backgroundColor: '#F8F7F4',
          borderLeft: `1px solid ${colors.border}`,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: '1px solid #E0DED9',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: colors.accent,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'Inter, system-ui, sans-serif',
                color: '#1A1916',
              }}
            >
              {CATEGORY_LABELS[note.color as NoteCategory]} Note
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              border: '1px solid #E0DED9',
              backgroundColor: 'transparent',
              color: '#6B6860',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {/* Meta row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '12px',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: '10px',
                fontWeight: 500,
                fontFamily: 'Inter, system-ui, sans-serif',
                padding: '2px 8px',
                borderRadius: '10px',
                backgroundColor: colors.bg,
                color: colors.accent,
                border: `1px solid ${colors.border}`,
              }}
            >
              {CATEGORY_LABELS[note.color as NoteCategory]}
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 500,
                fontFamily: 'Inter, system-ui, sans-serif',
                padding: '2px 8px',
                borderRadius: '10px',
                backgroundColor: '#F2F1EE',
                color: '#6B6860',
                border: '1px solid #E0DED9',
              }}
            >
              {PRIORITY_LABELS[note.priority]}
            </span>
            {note.resolved && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 500,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  backgroundColor: '#EEF7F2',
                  color: '#3A7A52',
                  border: '1px solid #8DC8A4',
                }}
              >
                ✓ Resolved
              </span>
            )}
          </div>

          {/* Anchor info */}
          {note.blockLabel && (
            <div
              style={{
                marginBottom: '12px',
                padding: '8px 10px',
                backgroundColor: '#F2F1EE',
                border: '1px solid #E0DED9',
                borderRadius: '6px',
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  color: '#9D9B96',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  marginBottom: '2px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Anchor
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#1A1916',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: 500,
                }}
              >
                {note.blockLabel}
              </div>
            </div>
          )}

          {/* Full note text */}
          <p
            style={{
              margin: '0 0 16px 0',
              fontSize: '13px',
              lineHeight: '1.6',
              color: '#1A1916',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {note.content}
          </p>

          {/* Tags */}
          {note.tags.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  fontSize: '10px',
                  color: '#9D9B96',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '6px',
                }}
              >
                Tags
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '11px',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      backgroundColor: '#F2F1EE',
                      color: '#6B6860',
                      border: '1px solid #E0DED9',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Created at */}
          <div
            style={{
              fontSize: '11px',
              color: '#B0AEA9',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {new Date(note.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid #E0DED9',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => { onResolve(note.id); onClose() }}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: note.resolved ? '1px solid #E0DED9' : '1px solid #8DC8A4',
              backgroundColor: note.resolved ? '#F2F1EE' : '#EEF7F2',
              color: note.resolved ? '#6B6860' : '#3A7A52',
              fontSize: '13px',
              fontWeight: 500,
              fontFamily: 'Inter, system-ui, sans-serif',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            {note.resolved ? '↩ Mark Unresolved' : '✓ Mark Resolved'}
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #E0DED9',
                backgroundColor: '#F2F1EE',
                color: '#6B6860',
                fontSize: '12px',
                fontFamily: 'Inter, system-ui, sans-serif',
                cursor: 'pointer',
              }}
            >
              Flag for Later
            </button>
            <button
              onClick={() => { onAskAI(note); onClose() }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '6px',
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.bg,
                color: colors.accent,
                fontSize: '12px',
                fontWeight: 500,
                fontFamily: 'Inter, system-ui, sans-serif',
                cursor: 'pointer',
              }}
            >
              ✦ Ask AI
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
