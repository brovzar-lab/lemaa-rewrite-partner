/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F8F7F4',
        surface: '#FFFFFF',
        'surface-raised': '#F2F1EE',
        border: '#E0DED9',
        'text-primary': '#1A1916',
        'text-secondary': '#6B6860',
        accent: '#3D6B8E',
        'accent-soft': '#EBF2F8',
        'note-story': '#C0443C',
        'note-character': '#C46E2C',
        'note-dialogue': '#B08A00',
        'note-scene': '#3A7A52',
        'note-research': '#2D6EA8',
        'note-producer': '#6B4A9E',
      },
      fontFamily: {
        ui: ['Inter', 'system-ui', 'sans-serif'],
        screenplay: ['"Courier Prime"', 'Courier', 'monospace'],
      },
      borderRadius: {
        panel: '8px',
        card: '6px',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out forwards',
        'slide-up': 'slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
