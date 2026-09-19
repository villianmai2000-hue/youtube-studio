import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        studio: {
          950: "#090A0F",
          900: "#0F111A",
          850: "#141724",
          800: "#1A1E30",
          700: "#272D47",
          600: "#3B4468",
          gold: "#F59E0B",
          goldLight: "#FDE68A",
          cyan: "#06B6D4",
          cyanGlow: "#22D3EE",
          redGlow: "#EF4444",
          purpleGlow: "#8B5CF6",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(245, 158, 11, 0.25)",
        cyanGlow: "0 0 25px -5px rgba(6, 182, 212, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
