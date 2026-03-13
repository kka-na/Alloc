// 9 Color Themes - each with 2 accent colors + gray (c4c4c4)
// Warm white background, gray as muted, two colors for accent/over/safe
// Colors stored as RGB values for Tailwind opacity support

// Helper: convert hex to RGB string "r g b"
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return '0 0 0'
  return `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
}

const themes = [
  {
    name: 'burnt-teal',
    accent: '#a53e14',
    over: '#a53e14',    // burnt orange - alerting
    safe: '#558a86',    // teal - calm
  },
  {
    name: 'blue-pink',
    accent: '#0041cd',
    over: '#ff96a1',    // pink - alerting
    safe: '#0041cd',    // blue - calm
  },
  {
    name: 'orange-lime',
    accent: '#ff712e',
    over: '#ff712e',    // orange - alerting
    safe: '#d4e694',    // lime - calm
  },
  {
    name: 'dark-cyan',
    accent: '#37bbe4',
    over: '#35342f',    // dark - alerting
    safe: '#37bbe4',    // cyan - calm
  },
  {
    name: 'beige-red',
    accent: '#ff4b59',
    over: '#ff4b59',    // red - alerting
    safe: '#e1e2d8',    // beige - calm
  },
  {
    name: 'purple-green',
    accent: '#c58fd2',
    over: '#c58fd2',    // purple - alerting
    safe: '#91e86a',    // green - calm
  },
  {
    name: 'navy-mint',
    accent: '#172339',
    over: '#172339',    // dark navy - alerting
    safe: '#cee7e4',    // mint - calm
  },
  {
    name: 'green-pastel',
    accent: '#63ca9f',
    over: '#63ca9f',    // green - stronger
    safe: '#cfe0c9',    // pastel green - calm
  },
  {
    name: 'gold-sky',
    accent: '#f8cd6b',
    over: '#f8cd6b',    // gold - alerting
    safe: '#b7d2e9',    // sky blue - calm
  },
]

// Base colors (same for all themes)
const baseColors = {
  bg: '#c4c4c4',        // gray background
  white: '#ffffff',     // card background (white)
  text: '#000000',      // black text
  muted: '#555555',     // charcoal (for readable secondary text)
}

export function applyRandomTheme() {
  const theme = themes[Math.floor(Math.random() * themes.length)]

  const root = document.documentElement
  // Set as RGB values for Tailwind opacity support
  root.style.setProperty('--alloc-bg', hexToRgb(baseColors.bg))
  root.style.setProperty('--alloc-white', hexToRgb(baseColors.white))
  root.style.setProperty('--alloc-text', hexToRgb(baseColors.text))
  root.style.setProperty('--alloc-muted', hexToRgb(baseColors.muted))
  root.style.setProperty('--alloc-accent', hexToRgb(theme.accent))
  root.style.setProperty('--alloc-over', hexToRgb(theme.over))
  root.style.setProperty('--alloc-safe', hexToRgb(theme.safe))

  console.log(`Theme applied: ${theme.name}`)
  return theme.name
}

export { themes, baseColors }
