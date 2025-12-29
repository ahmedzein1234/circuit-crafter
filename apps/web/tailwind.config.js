/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        circuit: {
          bg: '#1a1a2e',
          canvas: '#16213e',
          grid: '#0f3460',
          wire: '#e94560',
          'wire-active': '#00ff88',
          component: '#f0f0f0',
          'component-hover': '#ffffff',
          terminal: {
            positive: '#ef4444',
            negative: '#374151',
          },
          light: {
            bg: '#f8f9fa',
            canvas: '#ffffff',
            grid: '#e0e0e0',
            text: '#1a1a1a',
            border: '#d1d5db',
            wire: '#e94560',
            'wire-active': '#00cc66',
            component: '#2c3e50',
            'component-hover': '#1a252f',
            terminal: {
              positive: '#ef4444',
              negative: '#6b7280',
            },
          },
        },
      },
      animation: {
        'current-flow': 'currentFlow 1s linear infinite',
        spark: 'spark 0.3s ease-out',
        glow: 'glow 2s ease-in-out infinite',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        currentFlow: {
          '0%': { strokeDashoffset: '20' },
          '100%': { strokeDashoffset: '0' },
        },
        spark: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        glow: {
          '0%, 100%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.3)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      fontSize: {
        'mobile-xs': 'clamp(0.625rem, 2vw, 0.75rem)',
        'mobile-sm': 'clamp(0.75rem, 2.5vw, 0.875rem)',
        'mobile-base': 'clamp(0.875rem, 3vw, 1rem)',
        'mobile-lg': 'clamp(1rem, 3.5vw, 1.125rem)',
      },
      spacing: {
        'touch-target': '44px',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      minWidth: {
        'touch': '44px',
      },
      minHeight: {
        'touch': '44px',
        'touch-target': '44px',
      },
      zIndex: {
        'drawer': '40',
        'drawer-backdrop': '35',
        'mobile-nav': '50',
        'fab': '45',
      },
      screens: {
        'xs': '475px',
        'touch': { 'raw': '(hover: none) and (pointer: coarse)' },
        'mouse': { 'raw': '(hover: hover) and (pointer: fine)' },
      },
    },
  },
  plugins: [],
};
