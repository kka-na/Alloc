/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Alloc Color Palette
        'alloc': {
          'bg': '#D9E1EB',
          'white': '#F8F7F4',
          'text': '#1F3D68',
          'card-header': '#497CB3',
          'card-body': '#CBE3F5',
          'safe': '#8EC4B3',
          'over': '#E5896D',
          'accent': '#84B4E0',
          'muted': '#5a7a9a',
          'border': '#B8C8D8',
        },
      },
    },
  },
  plugins: [],
}
