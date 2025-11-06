// Casi Brand Colors & Design System

export const casiColors = {
  // Primary Brand Colors
  primary: '#6932FF',
  primaryDark: '#5128CC',
  primaryLight: '#932FFE',

  // Gradient
  gradient: 'linear-gradient(135deg, #6932FF 0%, #932FFE 100%)',
  gradientReverse: 'linear-gradient(135deg, #932FFE 0%, #6932FF 100%)',

  // Accent Colors
  teal: '#5EEAD4',
  pink: '#FF9F9F',
  green: '#B8EE8A',
  orange: '#FFA500',
  blue: '#3b82f6',

  // Sentiment Colors
  positive: '#B8EE8A',
  negative: '#FF9F9F',
  neutral: '#D1D5DB',

  // Grays
  gray50: '#f8f9fb',
  gray100: '#f1f3f5',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',

  // Backgrounds
  bgLight: '#ffffff',
  bgDark: '#1a1a2e',
  bgGradient:
    'linear-gradient(135deg, rgba(105, 50, 255, 0.15), rgba(147, 47, 254, 0.1), rgba(30, 58, 138, 0.15))',
}

export const casiFonts = {
  primary: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'Fira Code', 'Courier New', monospace",
}

export const casiAssets = {
  logo: '/landing-logo.png',
  logoDark: '/landing-logo-dark.png',
  logoSvg: '/landing-logo.svg',
  robot: '/landing-robot.png',
}

export const casiShadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  glow: '0 0 20px rgba(105, 50, 255, 0.3)',
}

export const casiAnimations = {
  duration: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
  },
  // Framer Motion easing (arrays)
  easing: {
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
  },
  // CSS easing strings (for use in style tags)
  easingCSS: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
}
