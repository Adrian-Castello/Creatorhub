/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Brand
        brand: {
          DEFAULT: '#8B5CF6',
          light: '#A78BFA',
        },
        accent: {
          DEFAULT: '#06B6D4',
          light: '#22D3EE',
        },
        // Neutrals — light
        canvas: '#FAFAFA',
        card: '#FFFFFF',
        hair: '#E5E7EB',
        ink: '#0A0A0A',
        sub: '#6B7280',
        // Neutrals — dark
        'd-canvas': '#0A0A0B',
        'd-card': '#141416',
        'd-hair': '#27272A',
        'd-ink': '#FAFAFA',
        'd-sub': '#A1A1AA',
        // Product status
        st: {
          solicitado: '#6B7280',
          recibido: '#3B82F6',
          testeando: '#F59E0B',
          activo: '#10B981',
          descartado: '#EF4444',
        },
      },
      borderRadius: {
        '2xl': '1rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
        'soft-lg': '0 2px 4px rgba(0,0,0,0.05), 0 12px 32px rgba(0,0,0,0.10)',
        glow: '0 0 0 1px rgba(139,92,246,0.15), 0 8px 32px rgba(139,92,246,0.12)',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        wave: {
          '0%, 60%, 100%': { transform: 'rotate(0deg)' },
          '10%, 30%': { transform: 'rotate(14deg)' },
          '20%, 40%': { transform: 'rotate(-8deg)' },
          '50%': { transform: 'rotate(10deg)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'pop-in': 'pop-in 0.25s cubic-bezier(0.16,1,0.3,1)',
        'slide-up': 'slide-up 0.3s cubic-bezier(0.16,1,0.3,1)',
        wave: 'wave 2.4s ease-in-out 0.4s 2',
      },
    },
  },
  plugins: [],
}
