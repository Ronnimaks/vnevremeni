/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        poet: {
          dark: '#0f0f11',
          card: '#1a1a1d',
          accent: '#c8a97e', // Elegant gold/bronze
          light: '#f5f5f5',
          muted: '#888888',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'], // Elegant serif for headings
      }
    },
  },
  plugins: [],
}
