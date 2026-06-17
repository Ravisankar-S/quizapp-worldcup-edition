/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#6C63FF",
          secondary: "#FF6584",
          accent: "#43E97B",
          warning: "#F7971E",
          danger: "#FF4D4F",
          bg: "#0F0E17",
          surface: "#1A1A2E",
          light: "#F5F5F5",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}