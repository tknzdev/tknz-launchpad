import plugin from "tailwindcss/plugin";
import { addIconSelectors } from "@iconify/tailwind";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        xs: "390px",
      },

      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
        xxs: ["0.5rem", { lineHeight: "0.625rem" }],
      },

      fontFamily: {
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "Consolas",
          "Monaco",
          "Courier New",
          "monospace",
        ],
        cyber: ["Orbitron", "Exo 2", "Rajdhani", "sans-serif"],
      },

      colors: {
        // Cyberpunk color scheme
        cyber: {
          black: "#000000",
          dark: "#0a0a0a",
          darker: "#050505",
          green: {
            50: "#f0fff4",
            100: "#dcfce7",
            200: "#bbf7d0",
            300: "#86efac",
            400: "#4ade80",
            500: "#22c55e",
            600: "#16a34a",
            700: "#15803d",
            800: "#166534",
            900: "#14532d",
            950: "#052e16",
            neon: "#00ff41",
            matrix: "#00ff00",
            terminal: "#39ff14",
          },
          purple: {
            neon: "#ff00ff",
            dark: "#4c1d95",
            light: "#a855f7",
          },
          blue: {
            neon: "#00ffff",
            electric: "#0080ff",
          },
          red: {
            neon: "#ff073a",
            error: "#dc2626",
          },
          yellow: {
            neon: "#ffff00",
            warning: "#fbbf24",
          },
        },
        // Keep existing neutral colors but make them darker
        neutral: {
          50: "#0a0a0a",
          100: "#111111",
          200: "#1a1a1a",
          300: "#262626",
          400: "#404040",
          500: "#525252",
          600: "#737373",
          700: "#a3a3a3",
          750: "#b8b8b8",
          800: "#d4d4d4",
          850: "#e5e5e5",
          900: "#f5f5f5",
          925: "#f9f9f9",
          950: "#ffffff",
        },
        // Update primary to cyber green
        primary: {
          DEFAULT: "#00ff41",
          50: "#f0fff4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        // Keep other colors but adjust for dark theme
        amber: {
          DEFAULT: "#fbbf24",
          500: "#f59e0b",
        },
        emerald: {
          DEFAULT: "#00ff41",
          500: "#10b981",
        },
        rose: {
          DEFAULT: "#ff073a",
          500: "#ef4444",
        },
      },

      animation: {
        glow: "glow 2s ease-in-out infinite alternate",
        flicker: "flicker 0.15s infinite linear",
        scan: "scan 2s linear infinite",
        matrix: "matrix 20s linear infinite",
        "pulse-green": "pulse-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "cyber-pulse": "cyber-pulse 1.5s ease-in-out infinite",
      },

      keyframes: {
        glow: {
          "0%": {
            "box-shadow": "0 0 5px #00ff41, 0 0 10px #00ff41, 0 0 15px #00ff41",
            "text-shadow": "0 0 5px #00ff41",
          },
          "100%": {
            "box-shadow":
              "0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41",
            "text-shadow": "0 0 10px #00ff41",
          },
        },
        flicker: {
          "0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%": {
            opacity: "0.99",
            filter: "drop-shadow(0 0 1px rgba(0, 255, 65, 0.8))",
          },
          "20%, 21.999%, 63%, 63.999%, 65%, 69.999%": {
            opacity: "0.4",
            filter: "none",
          },
        },
        scan: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        matrix: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "pulse-green": {
          "0%, 100%": {
            opacity: "1",
            "box-shadow": "0 0 0 0 rgba(0, 255, 65, 0.7)",
          },
          "50%": {
            opacity: "0.5",
            "box-shadow": "0 0 0 10px rgba(0, 255, 65, 0)",
          },
        },
        "cyber-pulse": {
          "0%, 100%": {
            "border-color": "#00ff41",
            "box-shadow": "0 0 5px rgba(0, 255, 65, 0.5)",
          },
          "50%": {
            "border-color": "#39ff14",
            "box-shadow":
              "0 0 20px rgba(0, 255, 65, 0.8), 0 0 30px rgba(0, 255, 65, 0.6)",
          },
        },
      },

      backgroundImage: {
        "cyber-grid": `
          linear-gradient(rgba(0, 255, 65, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 65, 0.1) 1px, transparent 1px)
        `,
        "cyber-gradient":
          "linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)",
        "neon-gradient": "linear-gradient(45deg, #00ff41, #39ff14, #00ff00)",
      },

      backgroundSize: {
        grid: "20px 20px",
      },

      boxShadow: {
        neon: "0 0 5px #00ff41, 0 0 10px #00ff41, 0 0 15px #00ff41",
        "neon-lg": "0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41",
        cyber: "0 0 20px rgba(0, 255, 65, 0.5)",
        "inner-neon": "inset 0 0 10px rgba(0, 255, 65, 0.3)",
      },

      textShadow: {
        neon: "0 0 5px #00ff41, 0 0 10px #00ff41",
        "neon-lg": "0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41",
      },
    },
  },
  plugins: [
    // Iconify plugin for clean selectors
    addIconSelectors({
      prefixes: ["ph"],
    }),
    // Custom plugin for text shadows and cyberpunk utilities
    plugin(function ({ addUtilities, theme }) {
      const textShadows = theme("textShadow");
      const textShadowUtilities = Object.keys(textShadows).reduce(
        (acc, key) => {
          acc[`.text-shadow-${key}`] = {
            textShadow: textShadows[key],
          };
          return acc;
        },
        {},
      );

      addUtilities({
        ...textShadowUtilities,
        ".cyber-border": {
          border: "1px solid #00ff41",
          boxShadow: "0 0 10px rgba(0, 255, 65, 0.3)",
        },
        ".cyber-bg": {
          background:
            "linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(10, 10, 10, 0.9) 100%)",
          backdropFilter: "blur(10px)",
        },
        ".matrix-bg": {
          backgroundImage: `
            linear-gradient(rgba(0, 255, 65, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 65, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        },
        ".scan-line": {
          position: "relative",
          overflow: "hidden",
        },
        ".scan-line::after": {
          content: '""',
          position: "absolute",
          top: "0",
          left: "0",
          right: "0",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, #00ff41, transparent)",
          animation: "scan 2s linear infinite",
        },
      });
    }),
  ],
};
