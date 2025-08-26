// AIMY Design System Tokens
// Comprehensive design tokens for consistent theming across the platform

export const colors = {
  // Base Colors
  base: {
    ink: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
    bg: {
      50: '#ffffff',
      100: '#fefefe',
      200: '#fdfdfd',
      300: '#fafafa',
      400: '#f5f5f5',
      500: '#e5e5e5',
      600: '#d4d4d4',
      700: '#a3a3a3',
      800: '#737373',
      900: '#525252',
      950: '#262626',
    },
  },

  // Accent Colors
  accent: {
    1: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
    2: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49',
    },
  },

  // Semantic Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  error: {
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
    950: '#450a0a',
  },

  // Special AIMY Colors
  aimy: {
    primary: '#6366f1', // Indigo
    secondary: '#8b5cf6', // Violet
    accent: '#06b6d4', // Cyan
    highlight: '#f59e0b', // Amber
    neon: {
      blue: '#00d4ff',
      green: '#00ff88',
      purple: '#8b5cf6',
      pink: '#ec4899',
    },
  },
} as const;

export const darkColors = {
  // Dark Theme Colors
  base: {
    ink: {
      50: '#0f172a',
      100: '#1e293b',
      200: '#334155',
      300: '#475569',
      400: '#64748b',
      500: '#94a3b8',
      600: '#cbd5e1',
      700: '#e2e8f0',
      800: '#f1f5f9',
      900: '#f8fafc',
      950: '#ffffff',
    },
    bg: {
      50: '#0a0a0a',
      100: '#171717',
      200: '#262626',
      300: '#404040',
      400: '#525252',
      500: '#737373',
      600: '#a3a3a3',
      700: '#d4d4d4',
      800: '#e5e5e5',
      900: '#f5f5f5',
      950: '#fafafa',
    },
  },

  // Dark Accent Colors
  accent: {
    1: {
      50: '#172554',
      100: '#1e3a8a',
      200: '#1e40af',
      300: '#1d4ed8',
      400: '#2563eb',
      500: '#3b82f6',
      600: '#60a5fa',
      700: '#93c5fd',
      800: '#bfdbfe',
      900: '#dbeafe',
      950: '#eff6ff',
    },
    2: {
      50: '#082f49',
      100: '#0c4a6e',
      200: '#075985',
      300: '#0369a1',
      400: '#0284c7',
      500: '#0ea5e9',
      600: '#38bdf8',
      700: '#7dd3fc',
      800: '#bae6fd',
      900: '#e0f2fe',
      950: '#f0f9ff',
    },
  },

  // Dark Semantic Colors
  success: {
    50: '#052e16',
    100: '#14532d',
    200: '#166534',
    300: '#15803d',
    400: '#16a34a',
    500: '#22c55e',
    600: '#4ade80',
    700: '#86efac',
    800: '#bbf7d0',
    900: '#dcfce7',
    950: '#f0fdf4',
  },

  warning: {
    50: '#451a03',
    100: '#78350f',
    200: '#92400e',
    300: '#b45309',
    400: '#d97706',
    500: '#f59e0b',
    600: '#fbbf24',
    700: '#fcd34d',
    800: '#fde68a',
    900: '#fef3c7',
    950: '#fffbeb',
  },

  error: {
    50: '#450a0a',
    100: '#7f1d1d',
    200: '#991b1b',
    300: '#b91c1c',
    400: '#dc2626',
    500: '#ef4444',
    600: '#f87171',
    700: '#fca5a5',
    800: '#fecaca',
    900: '#fee2e2',
    950: '#fef2f2',
  },

  // Dark AIMY Colors
  aimy: {
    primary: '#818cf8', // Lighter indigo for dark theme
    secondary: '#a78bfa', // Lighter violet for dark theme
    accent: '#22d3ee', // Lighter cyan for dark theme
    highlight: '#fbbf24', // Lighter amber for dark theme
    neon: {
      blue: '#00d4ff',
      green: '#00ff88',
      purple: '#a78bfa',
      pink: '#f472b6',
    },
  },
} as const;

export const spacing = {
  // Base spacing scale
  px: '1px',
  0: '0px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
} as const;

export const borderRadius = {
  none: '0px',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
} as const;

export const shadows = {
  // Glassmorphism shadows
  glassmorphism: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 1px rgba(0, 0, 0, 0.1)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  
  // Neon glow effects
  neon: {
    blue: '0 0 20px rgba(0, 212, 255, 0.5), 0 0 40px rgba(0, 212, 255, 0.3)',
    green: '0 0 20px rgba(0, 255, 136, 0.5), 0 0 40px rgba(0, 255, 136, 0.3)',
    purple: '0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3)',
    pink: '0 0 20px rgba(236, 72, 153, 0.5), 0 0 40px rgba(236, 72, 153, 0.3)',
  },

  // Standard shadows
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
} as const;

export const typography = {
  // Font families
  fontFamily: {
    sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
    display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  },

  // Font sizes
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
    '7xl': ['4.5rem', { lineHeight: '1' }],
    '8xl': ['6rem', { lineHeight: '1' }],
    '9xl': ['8rem', { lineHeight: '1' }],
  },

  // Font weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Line heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

export const transitions = {
  // Duration
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },

  // Easing functions
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Common transitions
  common: {
    fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

export const animations = {
  // Framer Motion variants
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },

  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },

  // Hover animations
  hover: {
    lift: 'translateY(-2px)',
    scale: 'scale(1.02)',
    glow: '0 0 20px rgba(99, 102, 241, 0.3)',
  },
} as const;

// Theme configuration
export const theme = {
  colors,
  darkColors,
  spacing,
  borderRadius,
  shadows,
  typography,
  breakpoints,
  zIndex,
  transitions,
  animations,
} as const;

// CSS Variables for Tailwind
export const cssVariables = {
  // Base colors
  '--color-base-ink-50': colors.base.ink[50],
  '--color-base-ink-100': colors.base.ink[100],
  '--color-base-ink-200': colors.base.ink[200],
  '--color-base-ink-300': colors.base.ink[300],
  '--color-base-ink-400': colors.base.ink[400],
  '--color-base-ink-500': colors.base.ink[500],
  '--color-base-ink-600': colors.base.ink[600],
  '--color-base-ink-700': colors.base.ink[700],
  '--color-base-ink-800': colors.base.ink[800],
  '--color-base-ink-900': colors.base.ink[900],
  '--color-base-ink-950': colors.base.ink[950],

  '--color-base-bg-50': colors.base.bg[50],
  '--color-base-bg-100': colors.base.bg[100],
  '--color-base-bg-200': colors.base.bg[200],
  '--color-base-bg-300': colors.base.bg[300],
  '--color-base-bg-400': colors.base.bg[400],
  '--color-base-bg-500': colors.base.bg[500],
  '--color-base-bg-600': colors.base.bg[600],
  '--color-base-bg-700': colors.base.bg[700],
  '--color-base-bg-800': colors.base.bg[800],
  '--color-base-bg-900': colors.base.bg[900],
  '--color-base-bg-950': colors.base.bg[950],

  // Accent colors
  '--color-accent-1-500': colors.accent[1][500],
  '--color-accent-1-600': colors.accent[1][600],
  '--color-accent-1-700': colors.accent[1][700],
  '--color-accent-2-500': colors.accent[2][500],
  '--color-accent-2-600': colors.accent[2][600],
  '--color-accent-2-700': colors.accent[2][700],

  // Semantic colors
  '--color-success-500': colors.success[500],
  '--color-success-600': colors.success[600],
  '--color-warning-500': colors.warning[500],
  '--color-warning-600': colors.warning[600],
  '--color-error-500': colors.error[500],
  '--color-error-600': colors.error[600],

  // AIMY colors
  '--color-aimy-primary': colors.aimy.primary,
  '--color-aimy-secondary': colors.aimy.secondary,
  '--color-aimy-accent': colors.aimy.accent,
  '--color-aimy-highlight': colors.aimy.highlight,

  // Spacing
  '--spacing-1': spacing[1],
  '--spacing-2': spacing[2],
  '--spacing-3': spacing[3],
  '--spacing-4': spacing[4],
  '--spacing-6': spacing[6],
  '--spacing-8': spacing[8],
  '--spacing-12': spacing[12],
  '--spacing-16': spacing[16],
  '--spacing-20': spacing[20],
  '--spacing-24': spacing[24],

  // Border radius
  '--radius-sm': borderRadius.sm,
  '--radius-base': borderRadius.base,
  '--radius-md': borderRadius.md,
  '--radius-lg': borderRadius.lg,
  '--radius-xl': borderRadius.xl,

  // Shadows
  '--shadow-sm': shadows.sm,
  '--shadow-base': shadows.base,
  '--shadow-md': shadows.md,
  '--shadow-lg': shadows.lg,
  '--shadow-xl': shadows.xl,
  '--shadow-glassmorphism': shadows.glassmorphism.base,
  '--shadow-neon-blue': shadows.neon.blue,
  '--shadow-neon-green': shadows.neon.green,
  '--shadow-neon-purple': shadows.neon.purple,
  '--shadow-neon-pink': shadows.neon.pink,
} as const;

// Dark theme CSS variables
export const darkCssVariables = {
  // Base colors (dark theme)
  '--color-base-ink-50': darkColors.base.ink[50],
  '--color-base-ink-100': darkColors.base.ink[100],
  '--color-base-ink-200': darkColors.base.ink[200],
  '--color-base-ink-300': darkColors.base.ink[300],
  '--color-base-ink-400': darkColors.base.ink[400],
  '--color-base-ink-500': darkColors.base.ink[500],
  '--color-base-ink-600': darkColors.base.ink[600],
  '--color-base-ink-700': darkColors.base.ink[700],
  '--color-base-ink-800': darkColors.base.ink[800],
  '--color-base-ink-900': darkColors.base.ink[900],
  '--color-base-ink-950': darkColors.base.ink[950],

  '--color-base-bg-50': darkColors.base.bg[50],
  '--color-base-bg-100': darkColors.base.bg[100],
  '--color-base-bg-200': darkColors.base.bg[200],
  '--color-base-bg-300': darkColors.base.bg[300],
  '--color-base-bg-400': darkColors.base.bg[400],
  '--color-base-bg-500': darkColors.base.bg[500],
  '--color-base-bg-600': darkColors.base.bg[600],
  '--color-base-bg-700': darkColors.base.bg[700],
  '--color-base-bg-800': darkColors.base.bg[800],
  '--color-base-bg-900': darkColors.base.bg[900],
  '--color-base-bg-950': darkColors.base.bg[950],

  // Accent colors (dark theme)
  '--color-accent-1-500': darkColors.accent[1][500],
  '--color-accent-1-600': darkColors.accent[1][600],
  '--color-accent-1-700': darkColors.accent[1][700],
  '--color-accent-2-500': darkColors.accent[2][500],
  '--color-accent-2-600': darkColors.accent[2][600],
  '--color-accent-2-700': darkColors.accent[2][700],

  // Semantic colors (dark theme)
  '--color-success-500': darkColors.success[500],
  '--color-success-600': darkColors.success[600],
  '--color-warning-500': darkColors.warning[500],
  '--color-warning-600': darkColors.warning[600],
  '--color-error-500': darkColors.error[500],
  '--color-error-600': darkColors.error[600],

  // AIMY colors (dark theme)
  '--color-aimy-primary': darkColors.aimy.primary,
  '--color-aimy-secondary': darkColors.aimy.secondary,
  '--color-aimy-accent': darkColors.aimy.accent,
  '--color-aimy-highlight': darkColors.aimy.highlight,
} as const;

// Export types
export type ColorToken = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;
export type BorderRadiusToken = keyof typeof borderRadius;
export type ShadowToken = keyof typeof shadows;
export type TypographyToken = keyof typeof typography;
export type BreakpointToken = keyof typeof breakpoints;
export type ZIndexToken = keyof typeof zIndex;
export type TransitionToken = keyof typeof transitions;
export type AnimationToken = keyof typeof animations;

export default theme;
