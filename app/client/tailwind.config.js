/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg:               '#0a0a0a',
        surface:          '#141414',
        'surface-light':  '#1e1e1e',
        border:           'rgba(255,255,255,0.08)',
        accent:           '#E65100',
        'accent-light':   '#F57C00',
        'accent-warm':    '#FF9800',
        secondary:        '#059669',
        'secondary-light':'#10b981',
        'text-primary':   '#fafafa',
        'text-secondary': '#a1a1aa',
        'text-muted':     '#71717a',
        success:          '#059669',
        warning:          '#f59e0b',
        danger:           '#ef4444',
        'student-curious':    '#FF9800',
        'student-skeptic':    '#2196F3',
        'student-shy':        '#9C27B0',
        'student-disengaged': '#78909C',
        'student-rote':       '#E91E63',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
