import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // The Throne Palette - Warm dark tones
        onyx: {
          DEFAULT: '#1a1814',
          50: '#2a2622',
          100: '#221f1b',
          200: '#1a1814',
          300: '#14120f',
          400: '#0e0d0b',
        },
        parchment: {
          DEFAULT: '#f5f0e8',
          50: '#fdfcfa',
          100: '#faf8f4',
          200: '#f5f0e8',
          300: '#e8e0d0',
          400: '#d4c8b4',
        },
        gold: {
          DEFAULT: '#c9a961',
          50: '#faf6ed',
          100: '#f2e8d0',
          200: '#e5d2a3',
          300: '#d4b87a',
          400: '#c9a961',
          500: '#b8944a',
          600: '#9a7a3d',
          700: '#7d6232',
          800: '#5f4a26',
          900: '#42331b',
        },
        charcoal: {
          DEFAULT: '#2d2926',
          50: '#4a4540',
          100: '#3a3632',
          200: '#2d2926',
          300: '#1f1c1a',
        },
        cream: {
          DEFAULT: '#f8f4ec',
          100: '#fefdfb',
          200: '#f8f4ec',
          300: '#ede5d8',
        },
        // Warm regal chocolate tones
        regal: {
          DEFAULT: '#5c4033',
          light: '#7a5a45',
          dark: '#3d2a22',
          warm: '#6b4a38',
        },
        // Author page - Heavenly, angelic whites
        ivory: {
          DEFAULT: '#fffef9',
          50: '#ffffff',
          100: '#fffef9',
          200: '#fdfbf5',
          300: '#f9f6ef',
          400: '#f4efe5',
        },
        // Publisher page - Beige/gold like book cover
        manuscript: {
          DEFAULT: '#e8dcc8',
          50: '#f5f0e6',
          100: '#efe7d8',
          200: '#e8dcc8',
          300: '#dccfb5',
          400: '#d0c1a1',
          500: '#c4b38e',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-cormorant)', 'Cormorant Garamond', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out forwards',
        'fade-in-up': 'fadeInUp 1s ease-out forwards',
        'fade-in-slow': 'fadeIn 2s ease-out forwards',
        'text-reveal': 'textReveal 1.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'unblur': 'unblur 1s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.8s ease-out forwards',
        'slide-in-right': 'slideInRight 0.8s ease-out forwards',
        'breathe': 'breathe 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        textReveal: {
          '0%': { opacity: '0', filter: 'blur(10px)' },
          '100%': { opacity: '1', filter: 'blur(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(201, 169, 97, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(201, 169, 97, 0.6)' },
        },
        unblur: {
          '0%': { filter: 'blur(8px)', opacity: '0' },
          '100%': { filter: 'blur(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
      },
      transitionTimingFunction: {
        'throne': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
export default config;
