/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/renderer/index.html',
    './src/renderer/src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          50:  '#f0f0f8',
          100: '#d1d1e8',
          200: '#a3a3cc',
          300: '#7575b0',
          400: '#4747a0',
          500: '#1a1a40',
          600: '#141430',
          700: '#0e0e22',
          800: '#0a0a18',
          900: '#060610',
          950: '#030308',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in': 'slideIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cinema': 'linear-gradient(135deg, #0a0a14 0%, #12121e 50%, #0a0a14 100%)'
      }
    }
  },
  plugins: []
}
