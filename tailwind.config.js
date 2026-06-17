/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          surface: '#fff8f6',
          'surface-container': '#ffe9e6',
          'surface-container-highest': '#ffdad4',
          primary: '#ad2a26',
          secondary: '#d93f2b',
          tertiary: '#007cff',
          neutral: '#8f706b',
          'on-surface': '#2b1613',
          'on-primary': '#ffffff',
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