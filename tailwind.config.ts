import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 950: "#070d1f", 900: "#0a1330", 800: "#0f1d44", 700: "#162a5c" },
        gold: { 300: "#f1dc9a", 400: "#e6c76a", 500: "#d4af37", 600: "#b8932a" },
      },
      fontFamily: { serif: ["var(--font-serif)", "serif"], sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
