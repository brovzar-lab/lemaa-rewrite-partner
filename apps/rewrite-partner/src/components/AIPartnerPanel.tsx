import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { X, ChevronRight, Send, RotateCcw } from 'lucide-react'
import { useAIStore } from '../lib/aiStore'
import { sendMessage } from '../lib/aiService'
import type { AIContext } from '../lib/aiService'
import type { Note } from '../stores/useNotesStore'
import { useToast } from '../hooks/useToast'

const QUICK_PROMPTS = ["What's next?", 'Help me with this scene', 'Triage all notes']

interface ActiveNote {
  id: string
  content: string
  blockLabel?: string
}

interface AIPartnerPanelProps {
  screenplay: string
  notes: Note[]
  currentScene?: string
  activeNote?: ActiveNote | null
  onActiveNoteClear: () => void
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 0' }}>
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: '#3D6B8E',
            display: 'inline-block',
            animation: `pulse-soft 1.2s ease-in-out ${delay}ms infinite`,
          }}
        />
      ))}
    </div>
  )
}

function renderText(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  )
}

export function AIPartnerPanel({
  screenplay,
  notes,
  currentScene,
  activeNote,
  onActiveNoteClear,
}: AIPartnerPanelProps) {
  const { isOpen, messages, isStreaming, pendingSuggestion } = useAIStore()
  const { showToast } = useToast()
  const [inputValue, setInputValue] = useState('')
  const [errorInfo, setErrorInfo] = useState<{ msgId: string; text: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const seenNoteRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const doSend = useCallback(
    (text: string, note?: ActiveNote) => {
      const s = useAIStore.getState()
      if (s.isStreaming) return
      setErrorInfo(null)

      const context: AIContext = {
        screenplay,
        notes: notes.filter((n) => !n.resolved).map((n) => ({ id: n.id, content: n.content })),
        currentScene,
        activeNote: note ? { id: note.id, content: note.content } : undefined,
      }

      const history = s.messages
        .filter((m) => !m.streaming)
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

      s.addUserMessage(text)
      const assistantId = s.startAssistantMessage()

      sendMessage(
        context,
        text,
        history,
        (token) => useAIStore.getState().appendToMessage(assistantId, token),
        () => {
          useAIStore.getState().finalizeMessage(assistantId)
          const unresolved = notes.filter((n) => !n.resolved)
          if (unresolved.length > 0) {
            const next = unresolved[0]
            useAIStore.getState().setPendingSuggestion(`Nice — onto ${next.blockLabel}?`)
          }
        },
        (err) => {
          useAIStore.getState().finalizeMessage(assistantId)
          setErrorInfo({ msgId: assistantId, text: err })
          showToast('AI Partner error — ' + err.slice(0, 60), 'error')
        }
      )
    },
    [notes, screenplay, currentScene, showToast]
  )

  useEffect(() => {
    if (!activeNote) return
    if (activeNote.id === seenNoteRef.current) return
    seenNoteRef.current = activeNote.id
    useAIStore.getState().open()
    doSend(`Let's talk about this note: ${activeNote.content}`, activeNote)
    onActiveNoteClear()
  }, [activeNote, doSend, onActiveNoteClear])

  function handleSend() {
    const text = inputValue.trim()
    if (!text || isStreaming) return
    setInputValue('')
    doSend(text)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); handleSend() }
  }

  function handleAcceptSuggestion() {
    const unresolved = notes.filter((n) => !n.resolved)
    useAIStore.getState().setPendingSuggestion(null)
    if (unresolved.length > 0) {
      const next = unresolved[0]
      useAIStore.getState().open()
      doSend(`Let's work on: ${next.blockLabel}`, { id: next.id, content: next.content, blockLabel: next.blockLabel })
    }
  }

  const noApiKey =
    !import.meta.env.VITE_ANTHROPIC_API_KEY ||
    import.meta.env.VITE_ANTHROPIC_API_KEY === 'REPLACE_WITH_VALUE'

  // ── Collapsed strip ──────────────────────────────────────────────────────────
  if (!isOpen) {
    return (
      <aside
        className="flex-shrink-0 flex flex-col items-center py-5 px-2 gap-3"
        style={{
          width: 48,
          borderLeft: '1px solid #E0DED9',
          backgroundColor: pendingSuggestion ? '#EBF2F8' : '#F8F7F4',
          transition: 'background-color 0.3s',
        }}
      >
        <button
          onClick={() => useAIStore.getState().open()}
          className="w-8 h-8 rounded-full flex items-center justify-center animate-pulse-soft flex-shrink-0"
          style={{
            backgroundColor: pendingSuggestion ? '#3D6B8E' : '#EBF2F8',
            border: 'none',
            cursor: 'pointer',
          }}
          title="Open AI Partner"
        >
          <span style={{ fontSize: 12, color: pendingSuggestion ? '#FFF' : '#3D6B8E' }}>✦</span>
        </button>

        {pendingSuggestion ? (
          <button
            onClick={handleAcceptSuggestion}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flex: 1 }}
            title={pendingSuggestion}
          >
            <span
              style={{
                fontSize: 10,
                color: '#3D6B8E',
                fontFamily: 'Inter, system-ui, sans-serif',
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                transform: 'rotate(180deg)',
                display: 'block',
                lineHeight: 1.4,
              }}
            >
              {pendingSuggestion}
            </span>
          </button>
        ) : (
          <span
            style={{
              fontSize: 10,
              color: '#B0AEA9',
              fontFamily: 'Inter, system-ui, sans-serif',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)',
              userSelect: 'none',
              flex: 1,
            }}
          >
            Ready when you are.
          </span>
        )}

        <button
          onClick={() => useAIStore.getState().open()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#B0AEA9' }}
          title="Open AI Partner"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </aside>
    )
  }

  // ── Expanded panel ───────────────────────────────────────────────────────────
  return (
    <aside
      className="flex-shrink-0 flex flex-col animate-fade-in"
      style={{ width: 280, borderLeft: '1px solid #E0DED9', backgroundColor: '#EBF2F8' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 flex-shrink-0"
        style={{ borderBottom: '1px solid #D0DDE8' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="animate-pulse-soft"
            style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#3D6B8E', display: 'inline-block' }}
          />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1916', fontFamily: 'Inter, system-ui, sans-serif' }}>
            AI Partner
          </span>
        </div>
        <button
          onClick={() => useAIStore.getState().close()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6860', padding: 2 }}
          title="Collapse"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Demo notice */}
      {noApiKey && (
        <div
          className="mx-3 mt-2.5 px-2.5 py-2 rounded-card text-xs"
          style={{
            backgroundColor: '#FDF4EC',
            border: '1px solid #E8BE8C',
            color: '#C46E2C',
            fontFamily: 'Inter, system-ui, sans-serif',
            lineHeight: 1.5,
          }}
        >
          Demo mode — sample responses streaming. Add <code>VITE_ANTHROPIC_API_KEY</code> to .env.local for real AI.
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3" style={{ minHeight: 0 }}>
        {messages.length === 0 && (
          <div
            className="text-center py-8"
            style={{ color: '#7A90A4', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, lineHeight: 1.6 }}
          >
            <div style={{ fontSize: 20, marginBottom: 8 }}>✦</div>
            Ask anything about your script, or use a quick prompt below.
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            {msg.role === 'user' ? (
              <div
                className="rounded-card px-3 py-2 text-sm"
                style={{
                  maxWidth: 220,
                  backgroundColor: '#3D6B8E',
                  color: '#FFF',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  lineHeight: 1.5,
                  wordBreak: 'break-word',
                }}
              >
                {msg.content}
              </div>
            ) : (
              <div
                className="rounded-card px-3 py-2 text-sm w-full"
                style={{
                  backgroundColor: '#FFF',
                  color: '#1A1916',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  lineHeight: 1.6,
                  border: '1px solid #D0DDE8',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {msg.streaming && msg.content === '' ? (
                  <TypingDots />
                ) : (
                  <>
                    {renderText(msg.content)}
                    {msg.streaming && (
                      <span
                        style={{
                          display: 'inline-block',
                          width: 2,
                          height: '1em',
                          backgroundColor: '#3D6B8E',
                          marginLeft: 2,
                          verticalAlign: 'text-bottom',
                          animation: 'pulse-soft 1s ease-in-out infinite',
                        }}
                      />
                    )}
                    {errorInfo?.msgId === msg.id && (
                      <div className="flex items-center gap-2 mt-2">
                        <span style={{ fontSize: 11, color: '#C0443C' }}>{errorInfo.text.slice(0, 80)}</span>
                        <button
                          onClick={() => {
                            setErrorInfo(null)
                            const userMsgs = useAIStore.getState().messages.filter((m) => m.role === 'user')
                            if (userMsgs.length > 0) doSend(userMsgs[userMsgs.length - 1].content)
                          }}
                          className="flex items-center gap-1"
                          style={{
                            fontSize: 11,
                            color: '#3D6B8E',
                            background: 'none',
                            border: '1px solid #3D6B8E',
                            borderRadius: 4,
                            padding: '1px 6px',
                            cursor: 'pointer',
                            fontFamily: 'Inter, system-ui, sans-serif',
                          }}
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          Retry
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      <div
        className="px-3 pt-2 pb-2 flex flex-col gap-1.5 flex-shrink-0"
        style={{ borderTop: '1px solid #D0DDE8' }}
      >
        {QUICK_PROMPTS.map((qp) => (
          <button
            key={qp}
            onClick={() => doSend(qp)}
            disabled={isStreaming}
            className="text-left px-2.5 py-1.5 rounded-card text-xs"
            style={{
              backgroundColor: '#FFF',
              border: '1px solid #D0DDE8',
              color: isStreaming ? '#B0AEA9' : '#3D6B8E',
              fontFamily: 'Inter, system-ui, sans-serif',
              cursor: isStreaming ? 'not-allowed' : 'pointer',
            }}
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-2 flex items-center gap-2 flex-shrink-0">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          placeholder="Ask anything…"
          className="flex-1 px-3 py-1.5 rounded-card outline-none"
          style={{
            backgroundColor: '#FFF',
            border: '1px solid #D0DDE8',
            color: '#1A1916',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 13,
          }}
        />
        <button
          onClick={handleSend}
          disabled={isStreaming || !inputValue.trim()}
          style={{
            backgroundColor: isStreaming || !inputValue.trim() ? '#B0C8DC' : '#3D6B8E',
            border: 'none',
            borderRadius: 6,
            padding: '6px 8px',
            cursor: isStreaming || !inputValue.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Send className="w-3.5 h-3.5" style={{ color: '#FFF' }} />
        </button>
      </div>
    </aside>
  )
}
