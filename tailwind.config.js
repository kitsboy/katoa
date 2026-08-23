/** @type {import('tailwindcss').Config} */
// Design tokens & usage: docs/DESIGN.md
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'serif': ['DM Serif Display', 'Georgia', 'serif'],
        'display': ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      colors: {
        'sand-tan': {
          50: '#faf6f0',
          100: '#f5ede1',
          200: '#ecdac3',
          300: '#e1b382',
          400: '#e1b382',
          500: '#e1b382',
          600: '#c89666',
          700: '#b08050',
          800: '#8c6640',
          900: '#6b4d30',
        },
        'night-blue': {
          50: '#f0f5f6',
          100: '#dae5e7',
          200: '#b5cbd0',
          300: '#8fb1b8',
          400: '#5e8390',
          500: '#2d545e',
          600: '#254850',
          700: '#1e3c42',
          800: '#12343b',
          900: '#0d2529',
        },
        'night-blue-shadow': {
          50: '#e8f0f1',
          100: '#c5d8db',
          200: '#9fbfc4',
          300: '#79a6ad',
          400: '#4b7d87',
          500: '#2d545e',
          600: '#234349',
          700: '#12343b',
          800: '#0d2529',
          900: '#081a1d',
        },
        'charcoal': {
          950: '#050509',
          900: '#070711',
          800: '#0a0a14',
          700: '#0d0d1a',
        },
        'neon-cyan': {
          500: '#14E6FF',
          400: '#3DEBFF',
          600: '#00D4ED',
        },
        // Design-token accent for Katoa (family tokens: violet #a78bfa)
        'katoa-violet': {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#a78bfa',
          600: '#8b5cf6',
          700: '#7c3aed',
          800: '#6d28d9',
          900: '#5b21b6',
        },
        'katoa-fuchsia': {
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
        },
        'bitcoin-orange': {
          500: '#F7931A',
          400: '#F9A825',
          600: '#E67E00',
        },
        'jewel': {
          amber: '#f59e0b',
          teal: '#2dd4bf',
          emerald: '#34d399',
          violet: '#a78bfa',
          fuchsia: '#e879f9',
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '220': '220ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
  safelist: [
    'font-mono',
    'font-display',
    'backdrop-blur-md',
    'backdrop-blur-lg',
  ],
};
