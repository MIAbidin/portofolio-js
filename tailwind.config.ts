import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          800: '#111633',
          900: '#0d1130',
          950: '#0a0e27',
        },
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        body: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config