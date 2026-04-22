import { Node, mergeAttributes } from '@tiptap/core'

export const Dialogue = Node.create({
  name: 'dialogue',
  group: 'block',
  content: 'inline*',

  addAttributes() {
    return {
      id: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="dialogue"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'dialogue', class: 'dialogue' }), 0]
  },
})
