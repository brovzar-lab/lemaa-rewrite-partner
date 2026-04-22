import type { JSONContent } from '@tiptap/react'

function nodeText(node: JSONContent): string {
  if (!node.content) return ''
  return node.content
    .filter((n) => n.type === 'text')
    .map((n) => n.text ?? '')
    .join('')
}

export function docToFountain(doc: JSONContent): string {
  const lines: string[] = []

  for (const node of doc.content ?? []) {
    const text = nodeText(node)

    switch (node.type) {
      case 'sceneHeading':
        if (lines.length > 0) lines.push('')
        lines.push(text.toUpperCase())
        lines.push('')
        break
      case 'action':
        lines.push(text)
        lines.push('')
        break
      case 'characterName':
        if (lines.length > 0 && lines[lines.length - 1] !== '') lines.push('')
        lines.push(' '.repeat(22) + text.toUpperCase())
        break
      case 'parenthetical':
        lines.push(' '.repeat(16) + text)
        break
      case 'dialogue':
        lines.push(' '.repeat(10) + text)
        lines.push('')
        break
      case 'transition':
        if (lines.length > 0) lines.push('')
        lines.push(text.toUpperCase())
        lines.push('')
        break
    }
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()
}
