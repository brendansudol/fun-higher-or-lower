import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#0d1117',
        panel: '#121924',
        panelMuted: '#1a2434',
        ink: '#f2efe6',
        mist: '#a5b0c2',
        accent: '#ffb84d',
        accentDeep: '#cf7b00',
        success: '#43c59e',
        danger: '#f26d6d',
        line: 'rgba(255, 255, 255, 0.12)',
      },
      boxShadow: {
        glow: '0 20px 60px rgba(10, 17, 24, 0.35)',
      },
      backgroundImage: {
        'board-grid': 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
      },
      fontFamily: {
        sans: ['var(--font-space-grotesk)'],
        display: ['var(--font-fraunces)'],
      },
    },
  },
  plugins: [],
};

export default config;
