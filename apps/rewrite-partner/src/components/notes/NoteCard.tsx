import { useState } from 'react'
import type { Note, NoteCategory } from '../../stores/useNotesStore'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../stores/useNotesStore'

const PRIORITY_BADGE: Record<string, { label: string; style: React.CSSProperties } | null> = {
  critical: { label: 'Critical', style: { backgroundColor: '#C0443C', color: '#fff' } },
  high:     { label: 'High',     style: { backgroundColor: '#C46E2C', color: '#fff' } },
  low:      { label: 'Low',      style: { backgroundColor: 'transparent', color: '#3D6B8E', border: '1px solid #3D6B8E' } },
  medium:   null,
}

interface Props {
  note: Note
  isSelected: boolean
  onClick: () => void
  onResolve: () => void
}

export function NoteCard({ note, isSelected, onClick, onResolve }: Props) {
  const [hovered, setHovered] = useState(false)
  const colors = CATEGORY_COLORS[note.color as NoteCategory] ?? CATEGORY_COLORS.story
  const priorityBadge = PRIORITY_BADGE[note.priority] ?? null

  const preview = note.content.length > 80 ? note.content.slice(0, 80) + '…' : note.content

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: '6px',
        backgroundColor: note.resolved ? '#F2F1EE' : '#F8F7F4',
        border: `1px solid ${isSelected ? colors.accent : note.resolved ? '#E0DED9' : colors.border}`,
        borderLeft: `3px solid ${note.resolved ? '#D5D3CE' : colors.accent}`,
        cursor: 'pointer',
        opacity: note.resolved ? 0.65 : 1,
        boxShadow: isSelected ? `0 0 0 2px ${colors.accent}33` : 'none',
        transition: 'box-shadow 0.15s, border-color 0.15s, opacity 0.15s',
        padding: '10px 10px 10px 12px',
      }}
    >
      {/* Category + priority badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 500,
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: '1px 6px',
            borderRadius: '10px',
            backgroundColor: colors.bg,
            color: colors.accent,
            border: `1px solid ${colors.border}`,
          }}
        >
          {CATEGORY_LABELS[note.color as NoteCategory]}
        </span>
        {priorityBadge && (
          <span
            style={{
              fontSize: '10px',
              fontWeight: 500,
              fontFamily: 'Inter, system-ui, sans-serif',
              padding: '1px 6px',
              borderRadius: '10px',
              ...priorityBadge.style,
            }}
          >
            {priorityBadge.label}
          </span>
        )}
      </div>

      {/* Content preview */}
      <p
        style={{
          margin: '0 0 6px 0',
          fontSize: '12px',
          lineHeight: '1.5',
          color: note.resolved ? '#B0AEA9' : '#1A1916',
          fontFamily: 'Inter, system-ui, sans-serif',
          textDecoration: note.resolved ? 'line-through' : 'none',
        }}
      >
        {preview}
      </p>

      {/* Anchor label */}
      {note.blockLabel && (
        <p
          style={{
            margin: 0,
            fontSize: '10px',
            color: '#9D9B96',
            fontFamily: 'Inter, system-ui, sans-serif',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {note.blockLabel}
        </p>
      )}

      {/* Resolve hover action */}
      {(hovered || isSelected) && !note.resolved && (
        <button
          onClick={(e) => { e.stopPropagation(); onResolve() }}
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            fontSize: '10px',
            fontFamily: 'Inter, system-ui, sans-serif',
            color: '#3A7A52',
            backgroundColor: '#EEF7F2',
            border: '1px solid #8DC8A4',
            borderRadius: '4px',
            padding: '2px 6px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          ✓ Resolve
        </button>
      )}
      {note.resolved && (hovered || isSelected) && (
        <button
          onClick={(e) => { e.stopPropagation(); onResolve() }}
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            fontSize: '10px',
            fontFamily: 'Inter, system-ui, sans-serif',
            color: '#6B6860',
            backgroundColor: '#F2F1EE',
            border: '1px solid #D5D3CE',
            borderRadius: '4px',
            padding: '2px 6px',
            cursor: 'pointer',
          }}
        >
          ↩ Unresolve
        </button>
      )}
    </div>
  )
}
