/** @type {import('tailwindcss').Config} */
export default {
  // ЭТА СТРОЧКА ВКЛЮЧАЕТ ГЛОБАЛЬНУЮ ТЕМУ
  darkMode: "class",

  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        behance: {
          blue: "#0057ff",
          darkBlue: "#004be5",
          black: "#191919",
          grayBg: "#f9f9f9",
          border: "#e8e8e8",
          muted: "#5e5e5e",
          // Добавим темные тона для "Матрицы" прямо сюда
          darkBorder: "rgba(255,255,255,0.05)",
          darkBg: "#0a0a0a",
          darkCard: "#111111",
        },
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};