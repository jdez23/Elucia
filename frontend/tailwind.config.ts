import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
        sans: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        cream: {
          DEFAULT: '#f5f0e8',
          dark: '#ebe4d8',
          deep: '#ddd5c5',
        },
        ink: {
          DEFAULT: '#1a1714',
          soft: '#3d3830',
          ghost: '#8a8279',
          whisper: '#b5ada3',
        },
        bio: {
          teal: '#0a7a6e',
          'teal-bright': '#3fffd4',
          blue: '#2d6fa8',
          violet: '#6b4fa8',
        },
        background: 'rgb(var(--background))',
        foreground: 'rgb(var(--foreground))',
        card: {
          DEFAULT: 'rgb(var(--card))',
          foreground: 'rgb(var(--card-foreground))',
        },
        primary: {
          DEFAULT: 'rgb(var(--primary))',
          foreground: 'rgb(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary))',
          foreground: 'rgb(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted))',
          foreground: 'rgb(var(--muted-foreground))',
        },
        border: 'rgba(26,23,20,0.1)',
        input: 'rgb(var(--input))',
        ring: 'rgb(var(--ring))',
        destructive: { DEFAULT: 'rgb(var(--destructive))' },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}

export default config
