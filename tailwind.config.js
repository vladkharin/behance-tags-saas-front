/** @type {import('tailwindcss').Config} */
export default {
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
        },
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
