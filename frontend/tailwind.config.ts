import type { Config } from 'tailwindcss';

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        // Food-truck red (primary actions, accents)
        brand: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Deep navy (headers, calendar bar)
        navy: {
          50: '#f0f4f9',
          100: '#d9e2ef',
          200: '#b3c5df',
          300: '#7f9fc6',
          400: '#4f74a6',
          500: '#345489',
          600: '#274472',
          700: '#1f3559',
          800: '#1a2b47',
          900: '#0f1b30',
        },
      },
    },
  },
};
