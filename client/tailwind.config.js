/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Alloc Color Palette - CSS Variables for dynamic theming
        'alloc': {
          'bg': 'var(--alloc-bg)',
          'white': 'var(--alloc-white)',
          'text': 'var(--alloc-text)',
          'accent': 'var(--alloc-accent)',
          'over': 'var(--alloc-over)',
          'safe': 'var(--alloc-safe)',
          'muted': 'var(--alloc-muted)',
        },
      },
    },
  },
  plugins: [],
}
