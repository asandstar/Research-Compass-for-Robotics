/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#fafaf9',
        bg2: '#f5f5f4',
        ink: '#292524',
        muted: '#78716c',
        rule: '#e7e5e4',
        accent: '#0d9488',
        'accent-hover': '#0f766e',
        accent2: '#d97706',
        surface: '#ffffff',
        'border-subtle': 'rgba(0,0,0,0.06)',
        'border-default': 'rgba(0,0,0,0.09)',
        'border-strong': 'rgba(0,0,0,0.15)',
        dark: {
          bg: '#1c1917',
          bg2: '#292524',
          ink: '#e7e5e4',
          muted: '#a8a29e',
          rule: '#44403c',
          surface: '#292524',
          'border-subtle': 'rgba(255,255,255,0.06)',
          'border-default': 'rgba(255,255,255,0.09)',
          'border-strong': 'rgba(255,255,255,0.15)',
          accent: '#2dd4bf',
          'accent-hover': '#14b8a6',
          accent2: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'PingFang SC', 'Microsoft YaHei', 'Noto Sans CJK SC', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'elevated': '0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)',
        'navbar': '0 1px 0 rgba(0,0,0,0.04)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        'fast': '150ms',
      },
      fontSize: {
        'display': ['1.875rem', { lineHeight: '1.3', fontWeight: '700', letterSpacing: '-0.02em' }],
        'h1': ['1.5rem', { lineHeight: '1.35', fontWeight: '700', letterSpacing: '-0.01em' }],
        'h2': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
        'h3': ['1rem', { lineHeight: '1.5', fontWeight: '600' }],
        'body': ['0.9375rem', { lineHeight: '1.65' }],
        'caption': ['0.8125rem', { lineHeight: '1.5' }],
        'label': ['0.75rem', { lineHeight: '1.4' }],
      },
    },
  },
  plugins: [],
}
