/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'blood-red': '#ff3333',
        'dark-void': '#050505',
        'deep-blood': '#3a0000',
      },
      boxShadow: {
        'neon': '0 0 10px rgba(255, 51, 51, 0.5), 0 0 20px rgba(255, 51, 51, 0.3)',
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}