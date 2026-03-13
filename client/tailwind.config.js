/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Alloc Color Palette - Warm Cream Theme
        'alloc': {
          'bg': '#fff3d6',           // 배경: 웜 크림
          'white': '#fffcf7',        // 뉴트럴 화이트
          'text': '#2d2d2d',         // 차콜: 텍스트
          'card-header': '#1a0089',  // 메인 퍼플: 카드 헤더
          'card-body': '#fff8e8',    // 밝은 크림: 카드 바디
          'safe': '#b8c352',         // 올리브 그린
          'over': '#fe5e32',         // 오렌지 레드
          'accent': '#1a0089',       // 메인 퍼플
          'muted': '#6b6b6b',        // 뮤트 그레이
          'border': '#e8dcc4',       // 웜 보더
        },
      },
    },
  },
  plugins: [],
}
