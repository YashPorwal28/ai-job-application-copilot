/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#bcd2ff",
          300: "#8fb5ff",
          400: "#5b8dff",
          500: "#3466ff",
          600: "#1d45f0",
          700: "#1734cc",
          800: "#182ea3",
          900: "#1a2c80",
        },
      },
    },
  },
  plugins: [],
};
