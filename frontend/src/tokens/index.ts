// Design Tokens - JavaScript Export
// Can be imported and used directly in React components

import designTokens from './design-tokens.json';

export const tokens = designTokens;

// Helper functions for easy access
export const Colors = {
  primary: (shade = '500') => designTokens.colors.primary[shade],
  secondary: (shade = '500') => designTokens.colors.secondary[shade],
  success: (shade = '500') => designTokens.colors.success[shade],
  warning: (shade = '500') => designTokens.colors.warning[shade],
  danger: (shade = '500') => designTokens.colors.danger[shade],
  neutral: (shade = '500') => designTokens.colors.neutral[shade],
  background: designTokens.colors.background,
  surface: designTokens.colors.surface,
  border: designTokens.colors.border,
  text: designTokens.colors.text,
  textSecondary: designTokens.colors['text-secondary'],
  textMuted: designTokens.colors['text-muted'],
};

export const Typography = {
  fontSize: designTokens.typography.fontSize,
  fontWeight: designTokens.typography.fontWeight,
  fontFamily: designTokens.typography.fontFamily,
};

export const Spacing = designTokens.spacing;

export const BorderRadius = designTokens.borderRadius;

export const Shadows = designTokens.shadows;

export const Transitions = {
  fast: designTokens.transitions.fast,
  base: designTokens.transitions.base,
  slow: designTokens.transitions.slow,
};

export const Breakpoints = designTokens.breakpoints;

// Gradient helpers
export const Gradients = {
  primary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
  warning: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
  danger: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
  neutral: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
};

// Responsive media query helpers
export const Media = {
  sm: `@media (max-width: ${Breakpoints.sm})`,
  md: `@media (max-width: ${Breakpoints.md})`,
  lg: `@media (max-width: ${Breakpoints.lg})`,
  xl: `@media (max-width: ${Breakpoints.xl})`,
  smUp: `@media (min-width: ${Breakpoints.sm})`,
  mdUp: `@media (min-width: ${Breakpoints.md})`,
  lgUp: `@media (min-width: ${Breakpoints.lg})`,
  xlUp: `@media (min-width: ${Breakpoints.xl})`,
};

export default designTokens;
