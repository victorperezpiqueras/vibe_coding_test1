/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        board: {
          bg: "#0f172a",
          panel: "#111827",
        },
      },
    },
  },
  plugins: [],
};
