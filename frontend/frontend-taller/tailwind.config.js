/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#F5EBDD',      // Fondo hueso
          primary: '#F2765E', // Coral
          secondary: '#315B8C',// Azul
          dark: '#413333',     // Marrón oscuro
        }
      }
    },
  },
  plugins: [],
}