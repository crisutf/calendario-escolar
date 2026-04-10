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
        // Academic & Productivity Theme Colors (Professional Palette)
        'academic': {
          'navy': '#0f172a',    // Slate-900
          'gold': '#b45309',    // Amber-700
          'silver': '#94a3b8',  // Slate-400
          'cream': '#f8fafc',   // Slate-50
          'accent': '#6366f1',  // Indigo-500
        },
        'theme-calm': {
          bg: '#f8fafc', // slate-50
          accent: '#6366f1', // indigo-500
          text: '#1e293b', // slate-800
        },
        'theme-stress': {
          bg: '#fff1f2', // rose-50
          accent: '#e11d48', // rose-600
          text: '#881337', // rose-900
        },
        'theme-aggressive': {
          bg: '#fffbeb', // amber-50
          accent: '#d97706', // amber-600
          text: '#78350f', // amber-900
        },
        'theme-holiday': {
          bg: '#f0fdf4', // green-50
          accent: '#16a34a', // green-600
          text: '#14532d', // green-900
        }
      }
    },
  },
  plugins: [],
}
