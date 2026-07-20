/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#0B1220",
        // KNUST brand colours
        indigo: {
          DEFAULT: "#006B3F",   // KNUST forest green (replaces indigo)
          soft: "#E6F4EE",      // light green tint
        },
        sky: "#FDB913",         // KNUST gold (replaces sky blue)
        emerald: "#005030",     // deep KNUST green accent
        amber: "#B45309",
        crimson: "#DC2626",
        paper: "#F7F8FA",
        // explicit KNUST aliases for readability
        "knust-green": "#006B3F",
        "knust-gold": "#FDB913",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Public Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};