/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: 'var(--bg-surface)',
          muted: 'var(--bg-muted)',
        },
        surface: {
          DEFAULT: 'var(--on-surface)',
          muted: 'var(--on-surface-muted)',
          subtle: 'var(--on-surface-subtle)',
        },
        primary: {
          50: '#e6f8fb',
          100: '#cbeff6',
          200: '#9fe0ef',
          300: '#66cfe6',
          400: '#2ebdd9',
          500: '#0aa7c6',
          600: '#008fae',
          700: '#00708b',
          800: '#055a6e',
          900: '#004953'
        },
        accent: '#f59e0b'
      }
    },
  },
  plugins: [],
}

