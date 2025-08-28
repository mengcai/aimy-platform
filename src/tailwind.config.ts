import type { Config } from 'tailwindcss';
import { cssVariables, darkCssVariables } from '@aimy/shared/design-tokens';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base colors using CSS variables
        'base-ink': {
          50: 'var(--color-base-ink-50)',
          100: 'var(--color-base-ink-100)',
          200: 'var(--color-base-ink-200)',
          300: 'var(--color-base-ink-300)',
          400: 'var(--color-base-ink-400)',
          500: 'var(--color-base-ink-500)',
          600: 'var(--color-base-ink-600)',
          700: 'var(--color-base-ink-700)',
          800: 'var(--color-base-ink-800)',
          900: 'var(--color-base-ink-900)',
          950: 'var(--color-base-ink-950)',
        },
        'base-bg': {
          50: 'var(--color-base-bg-50)',
          100: 'var(--color-base-bg-100)',
          200: 'var(--color-base-bg-200)',
          300: 'var(--color-base-bg-300)',
          400: 'var(--color-base-bg-400)',
          500: 'var(--color-base-bg-500)',
          600: 'var(--color-base-bg-600)',
          700: 'var(--color-base-bg-700)',
          800: 'var(--color-base-bg-800)',
          900: 'var(--color-base-bg-900)',
          950: 'var(--color-base-bg-950)',
        },
        // Accent colors
        'accent-1': {
          500: 'var(--color-accent-1-500)',
          600: 'var(--color-accent-1-600)',
          700: 'var(--color-accent-1-700)',
        },
        'accent-2': {
          500: 'var(--color-accent-2-500)',
          600: 'var(--color-accent-2-600)',
          700: 'var(--color-accent-2-700)',
        },
        // Semantic colors
        success: {
          500: 'var(--color-success-500)',
          600: 'var(--color-success-600)',
        },
        warning: {
          500: 'var(--color-warning-500)',
          600: 'var(--color-warning-600)',
        },
        error: {
          500: 'var(--color-error-500)',
          600: 'var(--color-error-600)',
        },
        // AIMY brand colors
        aimy: {
          primary: 'var(--color-aimy-primary)',
          secondary: 'var(--color-aimy-secondary)',
          accent: 'var(--color-aimy-accent)',
          highlight: 'var(--color-aimy-highlight)',
        },
        // Border colors
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
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
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
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        'sm': 'var(--radius-sm)',
        'base': 'var(--radius-base)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
      },
      boxShadow: {
        'glassmorphism': 'var(--shadow-glassmorphism)',
        'neon-blue': 'var(--shadow-neon-blue)',
        'neon-green': 'var(--shadow-neon-green)',
        'neon-purple': 'var(--shadow-neon-purple)',
        'neon-pink': 'var(--shadow-neon-pink)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '1': 'var(--spacing-1)',
        '2': 'var(--spacing-2)',
        '3': 'var(--spacing-3)',
        '4': 'var(--spacing-4)',
        '6': 'var(--spacing-6)',
        '8': 'var(--spacing-8)',
        '12': 'var(--spacing-12)',
        '16': 'var(--spacing-16)',
        '20': 'var(--spacing-20)',
        '24': 'var(--spacing-24)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(99, 102, 241, 0.6)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glassmorphism': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        'neon-glow': 'linear-gradient(45deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
      },
      backdropFilter: {
        'glass': 'blur(16px) saturate(180%)',
        'glass-sm': 'blur(8px) saturate(180%)',
        'glass-lg': 'blur(24px) saturate(180%)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    // Custom plugin for CSS variables
    function({ addBase }: any) {
      addBase({
        ':root': cssVariables,
        '.dark': darkCssVariables,
      });
    },
  ],
};

export default config;
