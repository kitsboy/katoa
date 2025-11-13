/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'serif': ['DM Serif Display', 'Georgia', 'serif'],
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
      },
    },
  },
  plugins: [],
};
