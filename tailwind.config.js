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
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        deepBraai: 'rgb(var(--color-primary) / <alpha-value>)',
        charcoal: 'rgb(var(--color-charcoal) / <alpha-value>)',
        flame: 'rgb(var(--color-flame) / <alpha-value>)',
        gold: 'rgb(var(--color-gold) / <alpha-value>)',
        cream: 'rgb(var(--color-cream) / <alpha-value>)',
      },
      fontFamily: {
        // Body — always Inter
        sans: ['var(--font-inter)', ...fontFamily.sans],
        body: ['var(--font-inter)', ...fontFamily.sans],
        // Headings — shop's chosen font, falls back to Plus Jakarta Sans
        heading: ['var(--font-shop-display, var(--font-jakarta))', 'var(--font-jakarta)', ...fontFamily.sans],
        display: ['var(--font-shop-display, var(--font-jakarta))', 'var(--font-jakarta)', ...fontFamily.sans],
        // Named font options (for shop admin picker previews)
        jakarta: ['var(--font-jakarta)', ...fontFamily.sans],
        syne: ['var(--font-syne)', ...fontFamily.sans],
        playfair: ['var(--font-playfair)', 'Georgia', 'serif'],
        nunito: ['var(--font-nunito)', ...fontFamily.sans],
        space: ['var(--font-space)', ...fontFamily.sans],
        oswald: ['var(--font-oswald)', ...fontFamily.sans],
      },
      boxShadow: {
        glow: '0 10px 40px -20px rgba(16, 185, 129, 0.45)',
        'glow-lg': '0 20px 60px -20px rgba(16, 185, 129, 0.6)',
        'glow-gold': '0 10px 40px -20px rgba(16, 185, 129, 0.5)',
        'card': '0 4px 24px -8px rgba(0,0,0,0.08)',
        'card-hover': '0 16px 48px -12px rgba(0,0,0,0.12)',
        'dark': '0 24px 60px -20px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'flame-gradient': 'linear-gradient(135deg, #059669 0%, #10B981 50%, #D1FAE5 100%)',
        'dark-gradient': 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
        'cream-gradient': 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
        'gold-gradient': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      },
      animation: {
        'slide-up': 'slide-up 0.45s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-down': 'slide-down 0.45s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-left': 'slide-in-left 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.35s ease-out both',
        'scale-in': 'scale-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-bounce': 'scale-bounce 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'bounce-subtle': 'bounce-subtle 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
        'ping-slow': 'ping-slow 2s cubic-bezier(0,0,0.2,1) infinite',
        'marquee': 'marquee 20s linear infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        'slide-up': {
          from: { transform: 'translateY(20px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
        'slide-down': {
          from: { transform: 'translateY(-20px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
        'slide-in-left': {
          from: { transform: 'translateX(-30px)', opacity: 0 },
          to: { transform: 'translateX(0)', opacity: 1 },
        },
        'fade-in': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        'scale-in': {
          from: { transform: 'scale(0.92)', opacity: 0 },
          to: { transform: 'scale(1)', opacity: 1 },
        },
        'scale-bounce': {
          '0%': { transform: 'scale(0.85)', opacity: 0 },
          '60%': { transform: 'scale(1.05)', opacity: 1 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' },
          '50%': { boxShadow: '0 0 0 8px rgba(16, 185, 129, 0.15)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-8px) rotate(1deg)' },
          '66%': { transform: 'translateY(-4px) rotate(-1deg)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'ping-slow': {
          '0%': { transform: 'scale(1)', opacity: 1 },
          '75%, 100%': { transform: 'scale(2)', opacity: 0 },
        },
        'marquee': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          lg: '2rem',
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
