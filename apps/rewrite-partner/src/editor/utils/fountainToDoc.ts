import { Fountain } from 'fountain-js'
import type { Token } from 'fountain-js'
import type { JSONContent } from '@tiptap/react'

const IGNORED_TYPES = new Set([
  'title_page',
  'title',
  'author',
  'authors',
  'contact',
  'copyright',
  'credit',
  'source',
  'draft_date',
  'date',
  'notes',
  'information',
  'dialogue_begin',
  'dialogue_end',
  'dual_dialogue_begin',
  'dual_dialogue_end',
  'page_break',
  'spaces',
  'section',
  'synopsis',
  'note',
  'lyrics',
  'centered',
])

function tokenToNode(token: Token): JSONContent | null {
  const text = token.text?.trim() ?? ''

  switch (token.type) {
    case 'scene_heading':
      return { type: 'sceneHeading', content: text ? [{ type: 'text', text }] : [] }
    case 'action':
      return { type: 'action', content: text ? [{ type: 'text', text }] : [] }
    case 'character':
      return { type: 'characterName', content: text ? [{ type: 'text', text }] : [] }
    case 'dialogue':
      return { type: 'dialogue', content: text ? [{ type: 'text', text }] : [] }
    case 'parenthetical':
      return { type: 'parenthetical', content: text ? [{ type: 'text', text }] : [] }
    case 'transition':
      return { type: 'transition', content: text ? [{ type: 'text', text }] : [] }
    default:
      return null
  }
}

export function fountainToDoc(fountainText: string): JSONContent {
  const parser = new Fountain()
  const result = parser.parse(fountainText, true)
  const tokens = result.tokens

  const content: JSONContent[] = []

  for (const token of tokens) {
    if (IGNORED_TYPES.has(token.type)) continue
    const node = tokenToNode(token)
    if (node) content.push(node)
  }

  if (content.length === 0) {
    content.push({ type: 'action', content: [] })
  }

  return { type: 'doc', content }
}
