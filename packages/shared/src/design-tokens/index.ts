// Design tokens for AIMY's dark institutional theme with glassmorphism accents

export const colors = {
  // Primary palette
  primary: {
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
    950: '#082f49'
  },
  
  // Secondary palette (neon accents)
  secondary: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
    950: '#4a044e'
  },
  
  // Dark theme colors
  dark: {
    background: '#0a0a0a',
    surface: '#111111',
    surfaceElevated: '#1a1a1a',
    surfaceHover: '#1f1f1f',
    border: '#2a2a2a',
    borderHover: '#3a3a3a',
    text: {
      primary: '#ffffff',
      secondary: '#a3a3a3',
      tertiary: '#737373',
      disabled: '#525252'
    },
    accent: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  },
  
  // Glassmorphism colors
  glass: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.1)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    backdrop: 'rgba(0, 0, 0, 0.8)'
  },
  
  // Semantic colors
  semantic: {
    success: {
      light: '#10b981',
      main: '#059669',
      dark: '#047857'
    },
    warning: {
      light: '#f59e0b',
      main: '#d97706',
      dark: '#b45309'
    },
    error: {
      light: '#ef4444',
      main: '#dc2626',
      dark: '#b91c1c'
    },
    info: {
      light: '#3b82f6',
      main: '#2563eb',
      dark: '#1d4ed8'
    }
  }
};

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px
  '5xl': '8rem',    // 128px
  base: '1rem'      // 16px
};

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px'
};

export const shadows = {
  // Subtle shadows for depth
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  
  // Glassmorphism shadows
  glassmorphism: {
    light: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    medium: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    heavy: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
  },
  
  // Neon glow effects
  neon: {
    primary: '0 0 20px rgba(14, 165, 233, 0.5)',
    secondary: '0 0 20px rgba(217, 70, 239, 0.5)',
    success: '0 0 20px rgba(16, 185, 129, 0.5)',
    warning: '0 0 20px rgba(245, 158, 11, 0.5)',
    error: '0 0 20px rgba(239, 68, 68, 0.5)'
  }
};

export const typography = {
  // Font families
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
    display: ['Inter', 'system-ui', 'sans-serif']
  },
  
  // Font sizes
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    '7xl': '4.5rem',    // 72px
    '8xl': '6rem',      // 96px
    '9xl': '8rem'       // 128px
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
    black: '900'
  },
  
  // Line heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
  },
  
  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  }
};

export const transitions = {
  // Duration
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms'
  },
  
  // Easing functions
  easing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

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
  tooltip: 1800
};

// Glassmorphism utility classes
export const glassmorphism = {
  light: {
    background: colors.glass.background,
    border: `1px solid ${colors.glass.border}`,
    backdropFilter: 'blur(10px)',
    boxShadow: shadows.glassmorphism.light
  },
  medium: {
    background: colors.glass.background,
    border: `1px solid ${colors.glass.border}`,
    backdropFilter: 'blur(15px)',
    boxShadow: shadows.glassmorphism.medium
  },
  heavy: {
    background: colors.glass.background,
    border: `1px solid ${colors.glass.border}`,
    backdropFilter: 'blur(20px)',
    boxShadow: shadows.glassmorphism.heavy
  }
};

// Export all design tokens
export default {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  transitions,
  zIndex,
  glassmorphism
};
