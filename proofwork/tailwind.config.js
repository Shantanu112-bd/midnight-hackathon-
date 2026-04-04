/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#07090f',
        obsidian: '#0c0c0c',
        charcoal: '#111520',
        blueAccent: '#7aa0ff',
        purpleAccent: '#b07cff',
        greenSuccess: '#4dd6a0',
        limeAccent: '#ccff00',
        danger: '#ff4d4d',
        warning: '#ffcc00'
      },
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'xl': '2.5rem',
        'lg': '2rem',
        'md': '1.5rem',
      },
      zIndex: {
        '0': '0',
        '10': '10',
        '50': '50',
        '60': '60',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'stars-anim': {
          'from': { transform: 'translateY(0)' },
          'to': { transform: 'translateY(-2000px)' },
        },
        'stars-anim-mid': {
          'from': { transform: 'translateY(0)' },
          'to': { transform: 'translateY(-2000px)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'slide-up': {
          from: { transform: 'translateY(100px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' }
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'stars-anim': 'stars-anim 150s linear infinite',
        'stars-anim-mid': 'stars-anim-mid 100s linear infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'slide-up': 'slide-up 0.3s ease-out forwards'
      }
    },
  },
  plugins: [],
}
