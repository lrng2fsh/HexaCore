/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        hive: {
          bg: '#0a0a0f',
          surface: '#111118',
          panel: '#16161f',
          border: '#1e1e2e',
          amber: '#f59e0b',
          gold: '#d97706',
          honey: '#fbbf24',
          glow: '#fcd34d',
          dim: '#374151',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          muted: '#6b7280',
          text: '#e2e8f0',
          subtext: '#94a3b8',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-amber': 'pulseAmber 2s ease-in-out infinite',
        'glow-ring': 'glowRing 3s ease-in-out infinite',
        'drift': 'drift 8s ease-in-out infinite',
        'hex-spin': 'hexSpin 20s linear infinite',
        'signal': 'signal 1.5s ease-out infinite',
      },
      keyframes: {
        pulseAmber: {
          '0%, 100%': { boxShadow: '0 0 8px #f59e0b44, 0 0 20px #f59e0b22' },
          '50%': { boxShadow: '0 0 20px #f59e0b88, 0 0 40px #f59e0b44' },
        },
        glowRing: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        drift: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        hexSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        signal: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
      },
      backgroundImage: {
        'hex-pattern': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 66L0 50V16L28 0l28 16v34L28 66zm0-2l26-15V18L28 2 2 18v31l26 15z' fill='%23f59e0b08'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
