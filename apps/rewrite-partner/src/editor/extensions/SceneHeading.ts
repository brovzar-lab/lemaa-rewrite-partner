import { Node, mergeAttributes } from '@tiptap/core'

export const SceneHeading = Node.create({
  name: 'sceneHeading',
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
    return [{ tag: 'div[data-type="scene-heading"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'scene-heading', class: 'scene-heading' }), 0]
  },
})
