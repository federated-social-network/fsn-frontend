/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
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
        surface: {
          DEFAULT: '#0f1720',
          700: '#0b1317',
          800: '#070b0f',
        },
        muted: {
          DEFAULT: '#111318',
          700: '#0b0d10',
        },
        accent: '#f59e0b'
      }
    },
  },
  plugins: [],
}

