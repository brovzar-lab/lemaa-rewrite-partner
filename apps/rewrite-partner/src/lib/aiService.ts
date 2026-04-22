import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are a screenplay development partner helping a screenwriter work through rewrite notes.
You have access to their full screenplay and all unresolved notes.
Be concise, encouraging, and specific. Reference scene numbers and character names.
Focus on one thing at a time.`

export interface AIContext {
  screenplay: string
  notes: Array<{ id: string; content: string }>
  currentScene?: string
  activeNote?: { id: string; content: string }
}

const DEMO_RESPONSES: Record<string, string> = {
  whatsnext: `Looking at your notes, the most pressing issue is the **Records Room scene** — it's marked critical, and it's right. The scene ends too cleanly. Gittes just walks out with nothing, and it reads as a missed opportunity.

Here's a concrete fix: when Gittes opens the filing cabinet and finds the 1937 files missing, let him notice something small that shouldn't be there. A rubber band still tight around nothing. A single staple with no paper. Something that tells us *someone* knew this moment would come.

That one detail transforms the scene from a dead end into a clue. It also gives Gittes something to carry — not a fact, but a feeling. That's what keeps the audience leaning forward.

Want to work through what that detail could be?`,

  thisscene: `The office scene is carrying a lot of weight — it's introducing Gittes, Evelyn, and the inciting situation all at once. That's hard.

The dialogue is doing its job, but Evelyn is reactive throughout. She responds, deflects, retreats. There's a note about giving her agency, and I think the fix is small: let her *choose* something physical before she speaks. She crosses to the desk. She picks up the photograph. She puts it back down. Just one moment where her body makes a decision before her mouth does.

It signals to the audience: this woman has her own agenda. They'll watch her differently for the rest of the script.

What does she want in this scene that she can't say out loud?`,

  triage: `Here's where your notes stand, grouped by what needs to happen:

**Structural (fix before anything else)**
- Records Room scene needs a tangible discovery — currently a dead end
- Evelyn's inciting motivation needs external pressure to feel urgent

**Character (fix in draft, not outline)**
- Evelyn needs one moment of physical agency in the opening scene
- The groundskeeper is a dangling thread — use him in Act 2 or cut the hint

**Dialogue (last pass)**
- "It's a professional requirement." — protect this line, clean up the exchange before it
- Gittes talking to himself in the records room is genre shorthand — either make it his specific voice or cut it

The bourbon glass is marked resolved. Good call.

What do you want to tackle first?`,
}

function mockStreamResponse(
  prompt: string,
  onToken: (text: string) => void,
  onDone: () => void
) {
  let key = 'whatsnext'
  const lower = prompt.toLowerCase()
  if (lower.includes('this scene') || lower.includes('scene')) key = 'thisscene'
  if (lower.includes('triage') || lower.includes('all notes')) key = 'triage'

  const response = DEMO_RESPONSES[key] ?? DEMO_RESPONSES['whatsnext']
  const words = response.split(' ')
  let i = 0

  function tick() {
    if (i >= words.length) {
      onDone()
      return
    }
    const chunk = (i > 0 ? ' ' : '') + words[i]
    onToken(chunk)
    i++
    setTimeout(tick, 45 + Math.random() * 30)
  }

  tick()
}

export async function sendMessage(
  context: AIContext,
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  onToken: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void
) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined

  const contextBlock = [
    `SCREENPLAY:\n${context.screenplay}`,
    context.notes.length > 0
      ? `UNRESOLVED NOTES:\n${context.notes.map((n) => `- ${n.content}`).join('\n')}`
      : '',
    context.currentScene ? `CURRENT SCENE: ${context.currentScene}` : '',
    context.activeNote ? `ACTIVE NOTE: ${context.activeNote.content}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')

  const systemWithContext = `${SYSTEM_PROMPT}\n\n---\n${contextBlock}`

  if (!apiKey || apiKey === 'REPLACE_WITH_VALUE') {
    mockStreamResponse(userMessage, onToken, onDone)
    return
  }

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ]

  try {
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemWithContext,
      messages,
    })

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        onToken(chunk.delta.text)
      }
    }
    onDone()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    onError(msg)
  }
}
