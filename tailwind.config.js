/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        'apple-gray': '#f5f5f7',
        'apple-blue': '#0071e3',
        // Theme Colors
        'theme-calm': {
          bg: '#e0f2fe', // sky-100
          accent: '#38bdf8', // sky-400
          text: '#0c4a6e', // sky-900
        },
        'theme-stress': {
          bg: '#fee2e2', // red-100
          accent: '#ef4444', // red-500
          text: '#7f1d1d', // red-900
        },
        'theme-aggressive': {
          bg: '#ffedd5', // orange-100
          accent: '#f97316', // orange-500
          text: '#7c2d12', // orange-900
        },
        'theme-holiday': {
          bg: '#d1fae5', // emerald-100 (or maybe a festive mix, keeping it green/red for now)
          accent: '#10b981', // emerald-500
          text: '#064e3b', // emerald-900
        }
      }
    },
  },
  plugins: [],
}
