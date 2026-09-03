/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#060813',
          card: '#0a0f24',
          surface: '#0f1636',
          border: 'rgba(0, 240, 255, 0.15)',
        },
        neon: {
          cyan: '#00f0ff',
          emerald: '#00ff9d',
          purple: '#a855f7',
          amber: '#fbbf24',
          rose: '#ff0055',
        },
        brand: {
          50: '#ecfeff',
          100: '#cffafe',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
        }
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 240, 255, 0.25)',
        'neon-cyan-lg': '0 0 35px rgba(0, 240, 255, 0.4)',
        'neon-emerald': '0 0 20px rgba(0, 255, 157, 0.25)',
        'neon-purple': '0 0 20px rgba(168, 85, 247, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      }
    },
  },
  plugins: [],
}

