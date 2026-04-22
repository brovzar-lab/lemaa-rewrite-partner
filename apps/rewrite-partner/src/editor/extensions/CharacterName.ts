import { Node, mergeAttributes } from '@tiptap/core'

export const CharacterName = Node.create({
  name: 'characterName',
  group: 'block',
  content: 'inline*',

  addAttributes() {
    return {
      id: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="character-name"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'character-name', class: 'character-name' }), 0]
  },
})
