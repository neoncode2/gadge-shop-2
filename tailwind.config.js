/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-poppins)", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f3fbf7",
          100: "#dbf2e4",
          200: "#b7e5c9",
          300: "#8ed7ad",
          400: "#63c78e",
          500: "#35b270",
          600: "#24935a",
          700: "#1c7448",
          800: "#165f3b",
          900: "#114c31",
        },
        ink: {
          900: "#0f172a",
          800: "#1e293b",
          700: "#334155",
          600: "#475569",
          500: "#64748b",
          400: "#94a3b8",
          300: "#cbd5e1",
          200: "#e2e8f0",
          100: "#f1f5f9",
        },
      },
      boxShadow: {
        card: "0 10px 30px rgba(15, 23, 42, 0.08)",
      },
      borderRadius: {
        xl: "18px",
      },
    },
  },
  plugins: [],
};
