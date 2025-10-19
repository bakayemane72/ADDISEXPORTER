import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        bg: {
          base: "#0B0F14",
          surface: "#0F141A",
          card: "#141A21",
        },
        text: {
          primary: "#E6EBF2",
          muted: "#9AA7B2",
        },
        accent: {
          gold: "#D9A441",
          copper: "#B86A3C",
        },
        border: {
          DEFAULT: "#22303C",
          alt: "#2B3945",
        },
        success: "#38B682",
        warning: "#E9B949",
        error: "#E05252",
      },
      borderRadius: {
        card: "16px",
        input: "12px",
        pill: "9999px",
      },
      boxShadow: {
        default: "0 2px 12px rgba(0,0,0,.35)",
        hover: "0 6px 24px rgba(0,0,0,.45)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      fontWeight: {
        display: "800",
        heading: "700",
        body: "400",
        medium: "500",
      },
      spacing: {
        gutter: "24px",
      },
      gridTemplateColumns: {
        "12": "repeat(12, minmax(0, 1fr))",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.18s ease-out",
      },
      transitionDuration: {
        page: "220ms",
        enter: "180ms",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
