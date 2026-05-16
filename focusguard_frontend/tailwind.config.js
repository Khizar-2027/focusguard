/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Castle base
        castle: {
          bg:       '#0f1a0f',
          nav:      '#0a1208',
          surface:  '#162014',
          card:     '#1e2d1a',
          card2:    '#243322',
          border:   '#2d4228',
          border2:  '#3a5534',
          moss:     '#1a2e16',
          stone:    '#3d4a35',
        },
        // Content (light area)
        parchment: {
          DEFAULT:  '#f5f0e8',
          50:       '#fdfcf9',
          100:      '#f5f0e8',
          200:      '#ece5d6',
          300:      '#ddd5c2',
          400:      '#c8bda6',
          border:   '#e8e4db',
          border2:  '#d8d2c6',
          muted:    '#8a8a72',
          deep:     '#3a3a2e',
        },
        // Accents
        forest: {
          DEFAULT:  '#4a8c3f',
          light:    '#5ea853',
          dark:     '#2d6e45',
          muted:    '#8a9980',
          text:     '#2d5e26',
        },
        gold: {
          DEFAULT:  '#c9913a',
          light:    '#e8b04a',
          bright:   '#f5c842',
          text:     '#7a5520',
          bg:       'rgba(201,145,58,0.1)',
        },
        ember: {
          DEFAULT:  '#8b3a2a',
          light:    '#c0533f',
          bg:       'rgba(192,83,63,0.08)',
          border:   'rgba(192,83,63,0.3)',
        },
      },
      fontFamily: {
        serif:  ['Crimson Pro', 'Georgia', 'serif'],
        sans:   ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        castle: '10px',
      },
      boxShadow: {
        castle: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
        'castle-md': '0 4px 12px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
}