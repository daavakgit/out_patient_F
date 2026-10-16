/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#3D81E3',
      },
      fontFamily: {
        geist: ['Geist', 'sans-serif'],
        sans: ['Geist', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeSlideUp: {
          'from': { opacity: '0', transform: 'translateY(24px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeSlideUp: 'fadeSlideUp 0.8s ease both',
      },
    },
  },
  plugins: [],
};
