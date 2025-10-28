/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'orbitron': ['Orbitron', 'monospace'],
      },
      colors: {
        purple: {
          150: '#e9d5ff',
          250: '#d8b4fe',
          350: '#c084fc',
          450: '#a855f7',
          550: '#9333ea',
          650: '#7c3aed',
          750: '#6d28d9',
          850: '#5b21b6',
          950: '#3b0764',
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          'from': { 
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3)' 
          },
          'to': { 
            boxShadow: '0 0 30px rgba(168, 85, 247, 0.7), 0 0 60px rgba(168, 85, 247, 0.4)' 
          },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'purple-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        'purple-gradient-dark': 'linear-gradient(135deg, #4c1d95 0%, #581c87 50%, #7c2d12 100%)',
      }
    },
  },
  plugins: [],
}