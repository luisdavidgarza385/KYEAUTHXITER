import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "rgb(var(--bg-rgb) / <alpha-value>)",
          secondary: "rgb(var(--bg-secondary-rgb) / <alpha-value>)",
          card: "rgb(var(--bg-card-rgb) / <alpha-value>)",
          hover: "rgb(var(--bg-hover-rgb) / <alpha-value>)",
        },
        border: {
          DEFAULT: "rgb(var(--border-rgb) / <alpha-value>)",
          light: "rgb(var(--border-light-rgb) / <alpha-value>)",
        },
        text: {
          DEFAULT: "rgb(var(--text-rgb) / <alpha-value>)",
          muted: "rgb(var(--text-muted-rgb) / <alpha-value>)",
          dim: "rgb(var(--text-dim-rgb) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent-rgb) / <alpha-value>)",
          hover: "rgb(var(--accent-hover-rgb) / <alpha-value>)",
          glow: "rgb(var(--accent-glow-rgb) / <alpha-value>)",
        },
        success: "rgb(var(--success-rgb) / <alpha-value>)",
        danger: "rgb(var(--danger-rgb) / <alpha-value>)",
        warning: "rgb(var(--warning-rgb) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
