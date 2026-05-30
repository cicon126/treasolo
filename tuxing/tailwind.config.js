/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        neon: '#00ff88',
        dark: {
          900: '#0a0a14',
          800: '#0f0f1a',
          700: '#1a1a2e',
        },
      },
    },
  },
  plugins: [],
};
