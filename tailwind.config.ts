import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        display: ["'Bricolage Grotesque Variable'", "var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono Variable'", "ui-monospace", "monospace"],
      },
      colors: {
        cream: "#FAF8F2",
        ink: "#141414",
        pasture: "#16A34A",
        "pasture-deep": "#15803D",
        night: "#0E1512",
        "night-soft": "#16201B",
        wool: "#F0EBDD",
        "wool-line": "#E3DCC9",
        danger: "#DC2626",
        amber: "#D97706",
        "ink-soft": "#52525B",
        "ink-faint": "#8A8A80",
      },
      boxShadow: {
        lift: "0 2px 0 0 #141414",
        card: "0 1px 0 0 #E3DCC9, 0 12px 32px -16px rgba(20,20,20,0.18)",
        terminal: "0 24px 48px -16px rgba(14,21,18,0.45)",
      },
      borderRadius: {
        blob: "20px",
      },
    },
  },
  plugins: [],
};
export default config;
