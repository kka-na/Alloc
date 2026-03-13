/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Alloc Color Palette - 7 Core Colors
        'alloc': {
          'bg': '#fff3d6',           // 배경
          'white': '#fffcf7',        // 카드 배경
          'text': '#2d2d2d',         // 텍스트 (차콜)
          'accent': '#1a0089',       // 메인 (퍼플)
          'over': '#fe5e32',         // 초과 (오렌지)
          'safe': '#b8c352',         // 안전 (올리브)
          'muted': '#6b6b6b',        // 보조 텍스트
        },
      },
    },
  },
  plugins: [],
}
