/** @type {import('tailwindcss').Config} */
module.exports = {
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
        accent2: '#d97706',
      },
      fontFamily: {
        sans: ['InstrumentSans', 'PingFang SC', 'Microsoft YaHei', 'Noto Sans CJK SC', 'sans-serif'],
        mono: ['JetBrainsMono', 'monospace'],
      },
    },
  },
  plugins: [],
}
