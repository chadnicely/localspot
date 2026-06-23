import type { Config } from 'tailwindcss';

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        // On The Spot platform chrome (dashboards, marketing site)
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
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
