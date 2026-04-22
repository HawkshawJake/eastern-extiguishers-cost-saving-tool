import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './context/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#B8241C',
          'red-dark': '#8F1C15',
          'red-light': '#D63028',
          yellow: '#FFD600',
          black: '#0A0A0A',
          dark: '#1A1A1A',
        },
        eco: {
          green: '#2E7D32',
          light: '#E8F5E9',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
