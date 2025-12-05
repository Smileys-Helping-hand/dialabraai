/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#762C1B',
        deepBraai: '#762C1B',
        charcoal: '#1A1715',
        flame: '#E46A28',
        gold: '#F4C056',
        cream: '#FFF4E2',
      },
      fontFamily: {
        heading: ['Inter', ...fontFamily.sans],
        sans: ['Inter', ...fontFamily.sans],
        body: ['Inter', ...fontFamily.sans],
      },
      boxShadow: {
        glow: '0 10px 40px -20px rgba(228, 106, 40, 0.45)',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          lg: '2rem',
        },
      },
    },
  },
  plugins: [],
};
