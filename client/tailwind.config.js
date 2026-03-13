/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Alloc Color Palette - CSS Variables with RGB for opacity support
        'alloc': {
          'bg': 'rgb(var(--alloc-bg) / <alpha-value>)',
          'white': 'rgb(var(--alloc-white) / <alpha-value>)',
          'text': 'rgb(var(--alloc-text) / <alpha-value>)',
          'text-light': 'rgb(var(--alloc-text-light) / <alpha-value>)',
          'muted': 'rgb(var(--alloc-muted) / <alpha-value>)',
          'accent': 'rgb(var(--alloc-accent) / <alpha-value>)',
          'secondary': 'rgb(var(--alloc-secondary) / <alpha-value>)',
          'tertiary': 'rgb(var(--alloc-tertiary) / <alpha-value>)',
          'over': 'rgb(var(--alloc-over) / <alpha-value>)',
          'safe': 'rgb(var(--alloc-safe) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
}
