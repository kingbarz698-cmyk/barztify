/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7c3aed',
          container: '#5b21b6',
        },
        secondary:  { DEFAULT: '#06b6d4' },
        tertiary:   { DEFAULT: '#f59e0b' },
        error:      { DEFAULT: '#ef4444' },
        surface: {
          DEFAULT: '#0e1323',
          container: {
            DEFAULT: '#151c2e',
            high:    '#1e2640',
            highest: '#252e4a',
          },
        },
        'on-surface':         '#dee1f9',
        'on-surface-variant': '#9da3bd',
        'on-error':           '#ffffff',
        outline:              '#4a5068',
      },
      animation: {
        breathe: 'breathe 3s ease-in-out infinite',
        pulse:   'pulse 1.5s cubic-bezier(0.4,0,0.6,1) infinite',
        spin:    'spin 0.8s linear infinite',
      },
      keyframes: {
        breathe: {
          '0%,100%': { transform: 'scale(1)' },
          '50%':     { transform: 'scale(1.025)' },
        },
      },
    },
  },
  // Safelist: pastikan class-class penting tidak di-purge
  safelist: [
    { pattern: /bg-(white|primary|surface)\/[0-9]+/ },
    { pattern: /border-(white|primary)\/[0-9]+/ },
    { pattern: /hover:bg-(white|primary)\/[0-9]+/ },
    { pattern: /active:bg-(white|primary)\/[0-9]+/ },
  ],
  plugins: [],
}
