/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Se remapea 'blue' a violeta: todas las pantallas heredan el acento morado.
        blue: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#6d4aff',
          700: '#5b36e0',
          800: '#4a2cb8',
          900: '#2e1a7a',
          950: '#1e1150',
        },
        indigo: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          600: '#5b5bd6',
          700: '#4c4cc0',
          800: '#3b3b9a',
          900: '#2a2a70',
          950: '#1c1c4d',
        },
      },
      boxShadow: {
        glass: '0 10px 40px -10px rgba(91, 54, 224, 0.25)',
      },
    },
  },
  plugins: [],
}
