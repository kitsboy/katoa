/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'lavender': {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        'mocha': {
          50: '#FAF8F6',
          100: '#F5F0EB',
          200: '#E8DDD3',
          300: '#D4C0AD',
          400: '#B89A82',
          500: '#A47864',
          600: '#8B6150',
          700: '#6F4D3F',
          800: '#5A3E33',
          900: '#4A332A',
        },
        'mint': {
          50: '#F0FDF9',
          100: '#CCFBEF',
          200: '#99F6E0',
          300: '#5FE9D0',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
      },
    },
  },
  plugins: [],
};
