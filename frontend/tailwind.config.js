/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#00ffe6",
        "primary-dark": "#00ccb8",
        "accent-amber": "#ffbf00",
        "background-light": "#f5f8f8",
        "background-dark": "#0D0D0D",
        "surface-dark": "#1A1A1A",
        "surface-darker": "#141414",
        "bg-dark-alt": "#0f2321",
        "surface-dark-alt": "#162f2c",
        "surface-dark-alt-2": "#163330",
        "border-dark": "#204b47",
        "border-dark-alt": "#2e6b65",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
      boxShadow: {
        neon: "0 0 10px rgba(0, 255, 230, 0.3), 0 0 20px rgba(0, 255, 230, 0.1)",
        "neon-hover":
          "0 0 15px rgba(0, 255, 230, 0.5), 0 0 30px rgba(0, 255, 230, 0.2)",
        glow: "0 0 20px rgba(0, 255, 230, 0.15)",
        "glow-strong": "0 0 30px rgba(0, 255, 230, 0.25)",
      },
      backgroundImage: {
        grain:
          "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.05%22 fill=%22%23fff%22/%3E%3C/svg%3E')",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        scroll: "scroll 20s linear infinite",
      },
      keyframes: {
        scroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
