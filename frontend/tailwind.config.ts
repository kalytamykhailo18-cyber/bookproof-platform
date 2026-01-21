import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: '6px',
        md: '6px',
        sm: '4px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-left': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-right': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'zoom-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'zoom-out': {
          '0%': { opacity: '0', transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'flip-up': {
          '0%': { opacity: '0', transform: 'rotateX(90deg)' },
          '100%': { opacity: '1', transform: 'rotateX(0)' },
        },
        'flip-down': {
          '0%': { opacity: '0', transform: 'rotateX(-90deg)' },
          '100%': { opacity: '1', transform: 'rotateX(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-up-very-fast': 'fade-up 0.2s ease-out',
        'fade-up-fast': 'fade-up 0.4s ease-out',
        'fade-up': 'fade-up 0.6s ease-out',
        'fade-up-light-slow': 'fade-up 0.8s ease-out',
        'fade-up-slow': 'fade-up 1s ease-out',
        'fade-up-very-slow': 'fade-up 1.2s ease-out',
        'fade-down-very-fast': 'fade-down 0.2s ease-out',
        'fade-down-fast': 'fade-down 0.4s ease-out',
        'fade-down': 'fade-down 0.6s ease-out',
        'fade-down-light-slow': 'fade-down 0.8s ease-out',
        'fade-down-slow': 'fade-down 1s ease-out',
        'fade-down-very-slow': 'fade-down 1.2s ease-out',
        'fade-left-very-fast': 'fade-left 0.2s ease-out',
        'fade-left-fast': 'fade-left 0.4s ease-out',
        'fade-left': 'fade-left 0.6s ease-out',
        'fade-left-light-slow': 'fade-left 0.8s ease-out',
        'fade-left-slow': 'fade-left 1s ease-out',
        'fade-left-very-slow': 'fade-left 1.2s ease-out',
        'fade-right-very-fast': 'fade-right 0.2s ease-out',
        'fade-right-fast': 'fade-right 0.4s ease-out',
        'fade-right': 'fade-right 0.6s ease-out',
        'fade-right-light-slow': 'fade-right 0.8s ease-out',
        'fade-right-slow': 'fade-right 1s ease-out',
        'fade-right-very-slow': 'fade-right 1.2s ease-out',
        'zoom-in-very-fast': 'zoom-in 0.2s ease-out',
        'zoom-in-fast': 'zoom-in 0.4s ease-out',
        'zoom-in': 'zoom-in 0.6s ease-out',
        'zoom-in-light-slow': 'zoom-in 0.8s ease-out',
        'zoom-in-slow': 'zoom-in 1s ease-out',
        'zoom-in-very-slow': 'zoom-in 1.2s ease-out',
        'zoom-out-very-fast': 'zoom-out 0.2s ease-out',
        'zoom-out-fast': 'zoom-out 0.4s ease-out',
        'zoom-out': 'zoom-out 0.6s ease-out',
        'zoom-out-light-slow': 'zoom-out 0.8s ease-out',
        'zoom-out-slow': 'zoom-out 1s ease-out',
        'zoom-out-very-slow': 'zoom-out 1.2s ease-out',
        'flip-up-very-fast': 'flip-up 0.2s ease-out',
        'flip-up-fast': 'flip-up 0.4s ease-out',
        'flip-up': 'flip-up 0.6s ease-out',
        'flip-up-light-slow': 'flip-up 0.8s ease-out',
        'flip-up-slow': 'flip-up 1s ease-out',
        'flip-up-very-slow': 'flip-up 1.2s ease-out',
        'flip-down-very-fast': 'flip-down 0.2s ease-out',
        'flip-down-fast': 'flip-down 0.4s ease-out',
        'flip-down': 'flip-down 0.6s ease-out',
        'flip-down-light-slow': 'flip-down 0.8s ease-out',
        'flip-down-slow': 'flip-down 1s ease-out',
        'flip-down-very-slow': 'flip-down 1.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-in-fast': 'fade-in 0.2s ease-out',
        'fade-in-slow': 'fade-in 0.5s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
