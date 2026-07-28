/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
          sans: ['Nunito', 'sans-serif'],
          display: ['Fredoka', 'sans-serif'],
      },
      colors: {
          bunny: {
              light: '#ffe4e6', // Rose 50
              pink: '#fda4af', // Rose 300
              main: '#fb7185', // Rose 400
              dark: '#e11d48', // Rose 600
          }
      },
      animation: {
          'hop': 'hop 1s infinite',
          'fade-in': 'fadeIn 0.5s ease-out forwards',
          'bounce-in': 'bounceIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      },
      keyframes: {
          hop: {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-15px)' },
          },
          fadeIn: {
              '0%': { opacity: '0' },
              '100%': { opacity: '1' },
          },
          bounceIn: {
              '0%': { opacity: '0', transform: 'scale(0.5)' },
              '100%': { opacity: '1', transform: 'scale(1)' },
          }
      }
    }
  },
  plugins: [],
}
