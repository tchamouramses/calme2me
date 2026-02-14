/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        indigo: {
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
        },
        emerald: {
          500: "#10B981",
          600: "#059669",
          700: "#047857",
        },
        rose: {
          500: "#F43F5E",
          600: "#E11D48",
        },
      },
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
}

