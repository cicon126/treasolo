/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        neonPink: "#ff2a6d",
        neonCyan: "#05d9e8",
        neonYellow: "#f9c80e",
        neonGreen: "#00ff88",
        neonGold: "#ffd700",
        darkBlue: "#0a0a1a",
        darkPurple: "#1a1a3e",
      },
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
        rajdhani: ["Rajdhani", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
        scanline: "scanline 8s linear infinite",
        shake: "shake 0.5s ease-in-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "score-pop": "score-pop 300ms ease-out",
        "countdown-pop": "countdown-pop 1s ease-out",
        "go-pop": "go-pop 1.2s ease-out",
        blink: "blink 1s ease-in-out infinite",
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%, 100%": {
            textShadow:
              "0 0 5px #05d9e8, 0 0 10px #05d9e8, 0 0 20px #05d9e8, 0 0 40px #05d9e8",
          },
          "50%": {
            textShadow:
              "0 0 10px #05d9e8, 0 0 20px #05d9e8, 0 0 40px #05d9e8, 0 0 80px #05d9e8",
          },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-5px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(5px)" },
        },
        "pulse-glow": {
          "0%, 100%": {
            opacity: "1",
            boxShadow: "0 0 10px rgba(5, 217, 232, 0.5), 0 0 20px rgba(5, 217, 232, 0.3)",
          },
          "50%": {
            opacity: "0.8",
            boxShadow: "0 0 20px rgba(5, 217, 232, 0.8), 0 0 40px rgba(5, 217, 232, 0.5), 0 0 60px rgba(5, 217, 232, 0.3)",
          },
        },
        "score-pop": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)" },
        },
        "countdown-pop": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.2)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "0" },
        },
        "go-pop": {
          "0%": { transform: "scale(0.5)", color: "#05d9e8" },
          "50%": { transform: "scale(1.5)", color: "#ff2a6d" },
          "75%": { color: "#ffd700" },
          "100%": { transform: "scale(1)", color: "#00ff88" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
      },
    },
  },
  plugins: [],
};
