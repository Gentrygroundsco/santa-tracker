/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'santa-dark': '#071522',
        'santa-darker': '#0d1f2d',
        'santa-accent': '#6ee7b7',
        'santa-accent-2': '#7dd3fc',
        'santa-gold': '#f9c74f',
        'santa-warn': '#fbbf24',
        'santa-danger': '#f87171',
      },
      fontFamily: {
        'sans': ['Inter', 'Segoe UI', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 1.5s infinite ease-in-out',
        'ring': 'ring 1.6s infinite ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.2)', opacity: '0.7' },
        },
        'ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.9' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
