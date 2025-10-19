import type { Config } from "tailwindcss";

const corporateStack = [
  "\"IBM Plex Sans\"",
  "\"Segoe UI\"",
  "\"Helvetica Neue\"",
  "system-ui",
  "-apple-system",
  "sans-serif",
];

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
          base: "#05080C",
          surface: "#0C1118",
          card: "#111824",
        },
        text: {
          primary: "#F4F7FB",
          muted: "#98A3B1",
        },
        accent: {
          gold: "#D9A441",
          copper: "#B86A3C",
          blue: "#2C7BE5",
        },
        border: {
          DEFAULT: "#1D2733",
          alt: "#25313F",
        },
        success: "#3DBE8B",
        warning: "#E9B949",
        error: "#E05252",
        info: "#4F9BFF",
      },
      borderRadius: {
        card: "16px",
        input: "12px",
        pill: "9999px",
      },
      boxShadow: {
        default: "0 4px 24px rgba(4, 10, 22, 0.45)",
        hover: "0 12px 40px rgba(4, 10, 22, 0.55)",
      },
      fontFamily: {
        sans: corporateStack,
        heading: corporateStack,
        display: corporateStack,
        body: corporateStack,
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
        "pulse-border": {
          "0%": { boxShadow: "0 0 0 0 rgba(217, 164, 65, 0.4)" },
          "100%": { boxShadow: "0 0 0 12px rgba(217, 164, 65, 0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.18s ease-out",
        "pulse-border": "pulse-border 2.5s infinite",
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
