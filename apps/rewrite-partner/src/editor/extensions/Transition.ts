import { Node, mergeAttributes } from '@tiptap/core'

export const Transition = Node.create({
  name: 'transition',
  group: 'block',
  content: 'inline*',

  addAttributes() {
    return {
      id: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="transition"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'transition', class: 'transition' }), 0]
  },
})
