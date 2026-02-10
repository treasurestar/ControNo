import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './app/**/*.{vue,ts}',
    './shared/**/*.ts'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#f5f0eb',
          secondary: '#ffffff',
          accent: '#8b7355',
          'accent-hover': '#6d5a44',
          border: '#e0d5c9',
          dark: {
            bg: '#1a1a1a',
            secondary: '#2d2d2d',
            accent: '#a08060',
            'accent-hover': '#c0a080',
            border: '#404040'
          }
        },
        status: {
          ok: '#22c55e',
          vencendo: '#f59e0b',
          vencido: '#ef4444'
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif']
      }
    }
  },
  plugins: []
} satisfies Config
