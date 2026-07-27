import tailwindAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Core Brand — Executive University Library Palette
        brand: {
          50:  "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7cc8fb",
          400: "#38bdf8",
          500: "#0284c7",
          600: "#0369a1",
          700: "#1e40af",   // Primary Executive Royal Blue
          800: "#1e3a8a",   // Deep Corporate Navy
          900: "#0f172a",   // Slate Dark Navy
          950: "#020617",
        },
        gold: {
          50:  "#fffbe6",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#d97706",   // Muted Professional Amber
          600: "#b45309",
          700: "#92400e",
          800: "#78350f",
          900: "#451a03",
        },
        // Semantic shorthand
        ink:      "#0F172A",
        paper:    "#F8FAFC",
        indigo: {
          DEFAULT: "#1E40AF",
          soft: "#EFF6FF",
        },
        sky:      "#2563EB",
        emerald:  "#059669",
        amber:    "#D97706",
        crimson:  "#DC2626",
        "knust-green": "#1E40AF",
        "knust-gold":  "#D97706",

        // shadcn/ui required CSS variable tokens
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },

      fontFamily: {
        display: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        body:    ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono:    ["JetBrains Mono", "IBM Plex Mono", "monospace"],
        sans:    ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      boxShadow: {
        "glow-green": "0 0 20px rgba(30, 64, 175, 0.20)",
        "glow-gold":  "0 0 20px rgba(217, 119, 6, 0.20)",
        "card":       "0 1px 3px rgba(15,23,42,0.06), 0 4px 12px rgba(15,23,42,0.03)",
        "card-hover": "0 6px 20px rgba(15,23,42,0.10), 0 2px 6px rgba(15,23,42,0.04)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.5" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-in":        "fade-in 0.4s ease-out both",
        "slide-in-right": "slide-in-right 0.3s ease-out both",
        "shimmer":        "shimmer 2s linear infinite",
        "pulse-slow":     "pulse-slow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [
    tailwindAnimate,
  ],
};