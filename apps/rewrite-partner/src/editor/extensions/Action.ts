import { Node, mergeAttributes } from '@tiptap/core'

export const Action = Node.create({
  name: 'action',
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
    return [{ tag: 'div[data-type="action"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'action', class: 'action' }), 0]
  },
})
