import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import UniqueID from '@tiptap/extension-unique-id'
import { useEffect, useRef, useCallback, useState } from 'react'

import { SceneHeading } from './extensions/SceneHeading'
import { Action } from './extensions/Action'
import { CharacterName } from './extensions/CharacterName'
import { Dialogue } from './extensions/Dialogue'
import { Parenthetical } from './extensions/Parenthetical'
import { Transition } from './extensions/Transition'
import { fountainToDoc } from './utils/fountainToDoc'
import { docToFountain } from './utils/docToFountain'

export interface Note {
  id: string
  blockId: string
  categoryColor: string
  content: string
}

interface GutterDot {
  blockId: string
  top: number
  notes: Note[]
}

interface TooltipState {
  top: number
  text: string
}

const FOUNTAIN_NODE_TYPES = [
  'sceneHeading',
  'action',
  'characterName',
  'dialogue',
  'parenthetical',
  'transition',
]

const CUSTOM_EXTENSIONS = [
  SceneHeading,
  Action,
  CharacterName,
  Dialogue,
  Parenthetical,
  Transition,
]

interface ScreenplayEditorProps {
  content: string
  notes: Note[]
  onContentChange: (fountain: string) => void
  onNoteClick: (noteId: string) => void
  highlightBlockId?: string
  /** Called when the editor is ready with a helper to look up a block's id by its text content */
  onEditorReady?: (getBlockId: (text: string) => string | undefined) => void
}

export function ScreenplayEditor({
  content,
  notes,
  onContentChange,
  onNoteClick,
  highlightBlockId,
  onEditorReady,
}: ScreenplayEditorProps) {
  const editorWrapRef = useRef<HTMLDivElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)
  const [gutterDots, setGutterDots] = useState<GutterDot[]>([])
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevContentRef = useRef(content)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ paragraph: false, heading: false, bulletList: false, orderedList: false, listItem: false, blockquote: false, codeBlock: false, horizontalRule: false }),
      ...CUSTOM_EXTENSIONS,
      UniqueID.configure({ types: FOUNTAIN_NODE_TYPES }),
    ],
    content: fountainToDoc(content),
    onUpdate({ editor }) {
      const fountain = docToFountain(editor.getJSON())
      onContentChange(fountain)
    },
  })

  // Notify parent with block-id lookup helper after mount
  useEffect(() => {
    if (!editor || !onEditorReady) return
    const getBlockId = (text: string): string | undefined => {
      let found: string | undefined
      editor.state.doc.descendants((node) => {
        if (found) return false
        const nodeText = node.textContent?.trim()
        if (nodeText && nodeText.toLowerCase().includes(text.toLowerCase())) {
          found = node.attrs.id as string | undefined
        }
      })
      return found
    }
    onEditorReady(getBlockId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor])

  // Sync content when prop changes externally (not from editor itself)
  useEffect(() => {
    if (!editor || content === prevContentRef.current) return
    prevContentRef.current = content
    const pos = editor.state.selection.anchor
    editor.commands.setContent(fountainToDoc(content), false)
    try { editor.commands.setTextSelection(Math.min(pos, editor.state.doc.content.size)) } catch { /* ignore */ }
  }, [content, editor])

  // Compute gutter dot positions after render
  const recomputeGutter = useCallback(() => {
    const wrap = editorWrapRef.current
    if (!wrap || notes.length === 0) {
      setGutterDots([])
      return
    }

    const wrapTop = wrap.getBoundingClientRect().top + wrap.scrollTop

    const notesByBlock = new Map<string, Note[]>()
    for (const note of notes) {
      const arr = notesByBlock.get(note.blockId) ?? []
      arr.push(note)
      notesByBlock.set(note.blockId, arr)
    }

    const dots: GutterDot[] = []

    for (const [blockId, blockNotes] of notesByBlock.entries()) {
      const el = wrap.querySelector(`[data-id="${blockId}"]`) as HTMLElement | null
      if (!el) continue
      const rect = el.getBoundingClientRect()
      const top = rect.top - wrapTop + el.offsetHeight / 2 - 3
      dots.push({ blockId, top, notes: blockNotes })
    }

    setGutterDots(dots)
  }, [notes])

  useEffect(() => {
    if (!editor) return
    const handler = () => { recomputeGutter() }
    editor.on('update', handler)
    const ro = new ResizeObserver(recomputeGutter)
    if (editorWrapRef.current) ro.observe(editorWrapRef.current)
    recomputeGutter()
    return () => {
      editor.off('update', handler)
      ro.disconnect()
    }
  }, [editor, recomputeGutter])

  // Scroll + highlight on highlightBlockId change
  useEffect(() => {
    if (!highlightBlockId || !editorWrapRef.current) return
    const el = editorWrapRef.current.querySelector(`[data-id="${highlightBlockId}"]`) as HTMLElement | null
    if (!el) return

    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('block-highlight')
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
    highlightTimeoutRef.current = setTimeout(() => {
      el.classList.remove('block-highlight')
    }, 2000)

    return () => {
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
    }
  }, [highlightBlockId])

  function handleDotClick(dot: GutterDot) {
    onNoteClick(dot.notes[0].id)
  }

  function handleDotEnter(dot: GutterDot, e: React.MouseEvent) {
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const gutterRect = gutterRef.current?.getBoundingClientRect()
    const relTop = gutterRect ? rect.top - gutterRect.top + rect.height / 2 : rect.top
    const preview = dot.notes.map((n) => n.content.slice(0, 60)).join('\n')
    setTooltip({ top: relTop, text: preview })
  }

  function handleDotLeave() {
    setTooltip(null)
  }

  return (
    <div className="screenplay-editor-root" style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {/* Gutter */}
      <div
        ref={gutterRef}
        style={{
          width: '20px',
          flexShrink: 0,
          position: 'relative',
          backgroundColor: 'transparent',
        }}
      >
        {gutterDots.map((dot) => {
          const primaryColor = dot.notes[0].categoryColor
          const count = dot.notes.length
          return (
            <button
              key={dot.blockId}
              onClick={() => handleDotClick(dot)}
              onMouseEnter={(e) => handleDotEnter(dot, e)}
              onMouseLeave={handleDotLeave}
              title={dot.notes.map((n) => n.content.slice(0, 60)).join('\n')}
              style={{
                position: 'absolute',
                top: dot.top,
                left: '6px',
                width: count > 1 ? 'auto' : '6px',
                height: '6px',
                minWidth: '6px',
                borderRadius: count > 1 ? '6px' : '50%',
                backgroundColor: primaryColor,
                border: 'none',
                cursor: 'pointer',
                padding: count > 1 ? '0 3px' : 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '8px',
                color: '#fff',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 600,
                lineHeight: 1,
                zIndex: 2,
                transition: 'transform 0.1s',
              }}
              onMouseDown={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.3)' }}
              onMouseUp={(e) => { (e.currentTarget as HTMLElement).style.transform = '' }}
            >
              {count > 1 ? count : null}
            </button>
          )
        })}

        {tooltip && (
          <div
            style={{
              position: 'absolute',
              top: tooltip.top,
              left: '24px',
              backgroundColor: '#1A1916',
              color: '#F8F7F4',
              fontSize: '11px',
              fontFamily: 'Inter, system-ui, sans-serif',
              padding: '4px 8px',
              borderRadius: '4px',
              maxWidth: '200px',
              whiteSpace: 'pre-wrap',
              zIndex: 10,
              pointerEvents: 'none',
              lineHeight: 1.4,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            {tooltip.text}
          </div>
        )}
      </div>

      {/* Editor */}
      <div
        ref={editorWrapRef}
        className="screenplay-scroll"
        style={{ flex: 1, overflowY: 'auto', padding: '32px 48px', backgroundColor: '#FFFFFF', cursor: 'text' }}
        onClick={() => editor?.commands.focus()}
      >
        <EditorContent editor={editor} className="screenplay-content" />
      </div>
    </div>
  )
}
