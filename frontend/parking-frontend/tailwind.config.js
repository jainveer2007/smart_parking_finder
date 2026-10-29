/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          light: '#FBFBF9',
          warm: '#F7F6F2',
          card: '#FFFFFF',
          subtle: '#F1F4F1',
        },
        charcoal: {
          900: '#14181B',
          800: '#1E2328',
          700: '#2F363D',
          600: '#4A5560',
          500: '#697785',
          400: '#94A3B1',
          100: '#E9EEF2',
        },
        sage: {
          50: '#F4F7F4',
          100: '#E8EFE8',
          200: '#D2DFD3',
          300: '#A9C2AB',
          400: '#7FA583',
          500: '#5B8660',
          600: '#466C4A',
          700: '#38553C',
        },
        mint: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          500: '#10B981',
          600: '#059669',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -1px rgba(20, 24, 27, 0.04), 0 1px 3px -1px rgba(20, 24, 27, 0.02)',
        'soft': '0 10px 30px -4px rgba(20, 24, 27, 0.06), 0 4px 10px -2px rgba(20, 24, 27, 0.03)',
        'soft-lg': '0 20px 40px -8px rgba(20, 24, 27, 0.08), 0 6px 16px -4px rgba(20, 24, 27, 0.04)',
        'soft-hover': '0 18px 36px -6px rgba(56, 85, 60, 0.12), 0 8px 18px -4px rgba(20, 24, 27, 0.06)',
      },
    },
  },
  plugins: [],
};
