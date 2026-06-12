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
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        shepherd: {
          bg: "#FAFAF7",
          text: "#111111",
          green: "#16A34A",
          red: "#DC2626",
          yellow: "#D97706",
          border: "#E5E5E0",
          muted: "#6B7280",
        },
      },
    },
  },
  plugins: [],
};
export default config;
