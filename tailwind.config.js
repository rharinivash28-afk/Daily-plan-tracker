/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    screens: {
      xs: "400px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        purple: {
          50: "#EEEDFE",
          100: "#CECBF6",
          200: "#AFA9EC",
          400: "#7F77DD",
          600: "#534AB7",
          800: "#3C3489",
          900: "#26215C",
        },
        cat: {
          health:       { bg: "#EEEDFE", text: "#3C3489", dot: "#7F77DD" },
          mindfulness:  { bg: "#E1F5EE", text: "#085041", dot: "#1D9E75" },
          learning:     { bg: "#E6F1FB", text: "#0C447C", dot: "#378ADD" },
          fitness:      { bg: "#FAECE7", text: "#712B13", dot: "#D85A30" },
          productivity: { bg: "#FAEEDA", text: "#633806", dot: "#BA7517" },
          social:       { bg: "#FBEAF0", text: "#72243E", dot: "#D4537E" },
        },
        bg: {
          light: "#FAFAF9",
          dark: "#0F0F0F",
        },
        card: {
          light: "#FFFFFF",
          dark: "#1A1A1A",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          muted: "#6B7280",
          hint: "#9CA3AF",
          dark: "#F5F5F5",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
      keyframes: {
        hueRotate: {
          "0%": { filter: "hue-rotate(0deg)" },
          "100%": { filter: "hue-rotate(360deg)" },
        },
      },
      animation: {
        "hue-rotate": "hueRotate 4s linear infinite",
      },
    },
  },
  plugins: [],
};
