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
        'neon-bg': '#0f0c29',
        'neon-bg-mid': '#302b63',
        'neon-bg-light': '#24243e',
        'neon-cyan': '#00f5ff',
        'neon-pink': '#ff00ff',
        'neon-yellow': '#ffff00',
        'neon-green': '#00ff88',
        'neon-orange': '#ff6b35',
        'neon-purple': '#b967ff',
      },
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'cursive'],
        'mono': ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'glow-cyan': 'glow-cyan 2s ease-in-out infinite alternate',
        'glow-pink': 'glow-pink 2s ease-in-out infinite alternate',
        'glow-green': 'glow-green 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'pop': 'pop 0.4s ease-out',
        'confetti': 'confetti 3s ease-out forwards',
      },
      keyframes: {
        'glow-cyan': {
          'from': { boxShadow: '0 0 5px #00f5ff, 0 0 10px #00f5ff, 0 0 15px #00f5ff' },
          'to': { boxShadow: '0 0 10px #00f5ff, 0 0 20px #00f5ff, 0 0 30px #00f5ff, 0 0 40px #00f5ff' },
        },
        'glow-pink': {
          'from': { boxShadow: '0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 15px #ff00ff' },
          'to': { boxShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 30px #ff00ff, 0 0 40px #ff00ff' },
        },
        'glow-green': {
          'from': { boxShadow: '0 0 5px #00ff88, 0 0 10px #00ff88, 0 0 15px #00ff88' },
          'to': { boxShadow: '0 0 10px #00ff88, 0 0 20px #00ff88, 0 0 30px #00ff88, 0 0 40px #00ff88' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0) rotateY(180deg)', WebkitTransform: 'translateX(0) rotateY(180deg)' },
          '25%': { transform: 'translateX(-5px) rotateY(180deg)', WebkitTransform: 'translateX(-5px) rotateY(180deg)' },
          '75%': { transform: 'translateX(5px) rotateY(180deg)', WebkitTransform: 'translateX(5px) rotateY(180deg)' },
        },
        'pop': {
          '0%': { transform: 'rotateY(180deg) scale(1)', WebkitTransform: 'rotateY(180deg) scale(1)' },
          '50%': { transform: 'rotateY(180deg) scale(1.1)', WebkitTransform: 'rotateY(180deg) scale(1.1)' },
          '100%': { transform: 'rotateY(180deg) scale(1)', WebkitTransform: 'rotateY(180deg) scale(1)' },
        },
        'confetti': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
      },
      perspective: {
        '1000': '1000px',
      },
      transformStyle: {
        'preserve-3d': 'preserve-3d',
      },
      backfaceVisibility: {
        'hidden': 'hidden',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.perspective-1000': { perspective: '1000px' },
        '.preserve-3d': { transformStyle: 'preserve-3d' },
        '.backface-hidden': { backfaceVisibility: 'hidden' },
        '.rotate-y-180': { transform: 'rotateY(180deg)' },
      });
    },
  ],
};
