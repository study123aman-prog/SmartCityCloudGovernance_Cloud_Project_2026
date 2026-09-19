/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14221f",
        moss: "#2f5d50",
        ember: "#d96941",
        mist: "#f4f5ef",
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        sans: ["Trebuchet MS", "sans-serif"],
      },
    },
  },
  plugins: [],
};
