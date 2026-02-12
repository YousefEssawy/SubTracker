/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6366F1",
          light: "#818CF8",
          dark: "#4F46E5",
        },
        accent: {
          DEFAULT: "#EC4899",
          light: "#F472B6",
          dark: "#DB2777",
        },
        success: {
          DEFAULT: "#10B981",
          light: "#34D399",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FBBF24",
        },
        danger: {
          DEFAULT: "#EF4444",
          light: "#F87171",
        },
        surface: {
          light: "#FFFFFF",
          dark: "#1E293B",
        },
        background: {
          light: "#F8FAFC",
          dark: "#0F172A",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
        "glass-dark": "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
        card: "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
        "card-hover":
          "0 4px 16px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06)",
      },
      backdropBlur: {
        glass: "16px",
      },
    },
  },
  plugins: [],
};
