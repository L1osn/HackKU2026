/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0D0D0D', // Deep dark
        surface: '#1E1E2E', // Elevated card
        primary: '#00E676', // Bright accent
        secondary: '#C8C8C8', // Description text — brightened for legibility on dark surfaces
        positive: '#4CAF50',
        negative: '#F44336',
        neutral: '#D8D8D8',
        warning: '#FF9800',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'], // For tabular data
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        flash: {
          '0%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
          '100%': { backgroundColor: 'transparent' },
        },
        flashGreen: {
          '0%': { color: 'inherit' },
          '50%': { color: '#4CAF50' },
          '100%': { color: 'inherit' },
        },
        flashRed: {
          '0%': { color: 'inherit' },
          '50%': { color: '#F44336' },
          '100%': { color: 'inherit' },
        }
      },
      animation: {
        'flash-bg': 'flash 0.5s ease-in-out',
        'flash-green': 'flashGreen 0.5s ease-in-out',
        'flash-red': 'flashRed 0.5s ease-in-out',
      }
    },
  },
  plugins: [],
}
