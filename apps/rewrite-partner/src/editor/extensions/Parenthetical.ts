import { Node, mergeAttributes } from '@tiptap/core'

export const Parenthetical = Node.create({
  name: 'parenthetical',
  group: 'block',
  content: 'inline*',

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-id'),
        renderHTML: (attributes) => ({ 'data-id': attributes.id }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="parenthetical"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'parenthetical', class: 'parenthetical' }), 0]
  },
})
