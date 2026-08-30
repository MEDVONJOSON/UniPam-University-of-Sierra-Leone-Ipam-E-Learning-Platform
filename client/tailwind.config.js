/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        slgreen: {
          DEFAULT: '#0B5E3C',
          light: '#1E7A52',
          dark: '#073823',
        },
        slblue: {
          DEFAULT: '#0072C6',
          light: '#3B82F6',
          dark: '#1D4ED8',
        },
        brand: {
          50: '#EAF6F0',
          100: '#D2ECE0',
          200: '#A6D9C2',
          300: '#79C6A3',
          400: '#4DB385',
          500: '#2E9C6C',
          600: '#1E7A52',
          700: '#0B5E3C',
          800: '#094A30',
          900: '#073823',
        },
        gold: {
          DEFAULT: '#D4AF37',
          50: '#FDF6E3',
          100: '#FAEBC0',
          200: '#F3D583',
          300: '#EAC257',
          400: '#DFB13A',
          500: '#D4A017',
          600: '#B3860F',
          700: '#8C6900',
          800: '#6B4F00',
          900: '#4A3700',
        },
        ink: {
          DEFAULT: '#000000',
          soft: '#111827',
          muted: '#1F2937',
        },
        hover: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        unipam: {
          blue: '#0072C6',
          green: '#0B5E3C',
          lightBlue: '#1E7A52',
        }
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        soft: '0 8px 24px rgba(11, 94, 60, 0.08)',
        card: '0 12px 32px rgba(11, 94, 60, 0.10)',
        hover: '0 8px 24px rgba(37, 99, 235, 0.18)',
      },
      keyframes: {
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in-down': 'fade-in-down 0.6s ease-out'
      }
    },
  },
  plugins: [],
}
