// 9 Color Themes - each with 3 core colors
// Background: white, Loading bar bg: c4c4c4
// Priority: darker colors first

// Helper: convert hex to RGB string "r g b"
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return '0 0 0'
  return `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
}

// Helper: calculate luminance to determine if color is dark
function getLuminance(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return 0
  const r = parseInt(result[1], 16) / 255
  const g = parseInt(result[2], 16) / 255
  const b = parseInt(result[3], 16) / 255
  return 0.299 * r + 0.587 * g + 0.114 * b
}

const themes = [
  {
    name: 'salmon-sage',
    colors: ['#E9a58d', '#a6c2a2', '#ecded0'],
  },
  {
    name: 'yellow-blue',
    colors: ['#E5da77', '#72bdce', '#c4b79d'],
  },
  {
    name: 'blue-pink-red',
    colors: ['#057fb3', '#fdadbb', '#e35440'],
  },
  {
    name: 'teal-green-brown',
    colors: ['#A3bfb8', '#bbd6b0', '#b0833f'],
  },
  {
    name: 'blue-orange-teal',
    colors: ['#6593c1', '#ff9c1a', '#508974'],
  },
  {
    name: 'olive-peach-lavender',
    colors: ['#97b380', '#efd3ab', '#c9a3d4'],
  },
  {
    name: 'red-orange-coral',
    colors: ['#Ce5b41', '#ffb45a', '#f98569'],
  },
  {
    name: 'gold-olive-navy',
    colors: ['#E2ad60', '#c4c290', '#385e8c'],
  },
  {
    name: 'pink-green-teal',
    colors: ['#Ffcccc', '#238e28', '#67c1ac'],
  },
]

// Base colors (same for all themes)
const baseColors = {
  bg: '#c4c4c4',        // gray background
  white: '#ffffff',     // card/modal background (white)
  text: '#333333',      // soft black text
  textLight: '#f5f5f5', // light text for dark backgrounds
  muted: '#555555',     // charcoal for numbers
  barBg: '#c4c4c4',     // loading bar background
}

export function applyRandomTheme() {
  const theme = themes[Math.floor(Math.random() * themes.length)]

  // Sort colors by luminance (darkest first)
  const sortedColors = [...theme.colors].sort((a, b) => getLuminance(a) - getLuminance(b))

  // Assign: darkest = accent, middle = secondary, lightest = tertiary
  const accent = sortedColors[0]    // darkest - primary accent
  const secondary = sortedColors[1] // middle - for bars, etc
  const tertiary = sortedColors[2]  // lightest - for highlights

  const root = document.documentElement
  // Set as RGB values for Tailwind opacity support
  root.style.setProperty('--alloc-bg', hexToRgb(baseColors.bg))
  root.style.setProperty('--alloc-white', hexToRgb(baseColors.white))
  root.style.setProperty('--alloc-text', hexToRgb(baseColors.text))
  root.style.setProperty('--alloc-text-light', hexToRgb(baseColors.textLight))
  root.style.setProperty('--alloc-muted', hexToRgb(baseColors.muted))
  root.style.setProperty('--alloc-bar-bg', hexToRgb(baseColors.barBg))

  // Core colors (sorted by darkness)
  root.style.setProperty('--alloc-accent', hexToRgb(accent))
  root.style.setProperty('--alloc-secondary', hexToRgb(secondary))
  root.style.setProperty('--alloc-tertiary', hexToRgb(tertiary))

  // For compatibility: over uses accent, safe uses secondary
  root.style.setProperty('--alloc-over', hexToRgb(accent))
  root.style.setProperty('--alloc-safe', hexToRgb(secondary))

  console.log(`Theme applied: ${theme.name}`, { accent, secondary, tertiary })
  return theme.name
}

export { themes, baseColors }
