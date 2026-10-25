/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#DC2626', dark: '#B91C1C' },
      },
    },
  },
  plugins: [],
};
