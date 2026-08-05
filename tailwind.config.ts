import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#FBF2E4",
        surface: "#FFFDF8",
        "surface-2": "#F5EBDD",
        ink: "#191323",
        "ink-soft": "#4A4159",
        "ink-faint": "#7E7490",
        violet: "#8B5CF6",
        "violet-soft": "#E9DFFD",
        "violet-deep": "#6D3FE0",
        teal: "#2FC6B0",
        "teal-soft": "#D2F3ED",
        coral: "#FF6B5E",
        "coral-soft": "#FFDBD6",
        yellow: "#FFD84D",
        sand: "#FFEBAE",
        mint: "#CDF3EA",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "sans-serif"],
        sans: ['"Space Grotesk"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        pop: "5px 5px 0 #191323",
        "pop-sm": "3px 3px 0 #191323",
        "pop-lg": "8px 8px 0 #191323",
      },
      borderWidth: {
        "2.5": "2.5px",
      },
    },
  },
  plugins: [],
};

export default config;
