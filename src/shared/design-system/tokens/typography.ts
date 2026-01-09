/**
 * Rumbo Typography System
 * Based on Inter font family (optimized for screens and financial data)
 *
 * Features:
 * - Tabular numbers for consistent alignment
 * - Excellent legibility at small sizes (mobile-friendly)
 * - Variable font for performance
 *
 * @example
 * import { typography } from '@/shared/design-system/tokens';
 * <h1 style={{ fontFamily: typography.fontFamily.sans }}>Title</h1>
 */

export const typography = {
  /**
   * Font Families
   */
  fontFamily: {
    sans: 'var(--font-inter), system-ui, -apple-system, sans-serif',
    mono: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace',
  },

  /**
   * Font Sizes
   * Mobile-first approach: base sizes are optimized for mobile
   * Use Tailwind responsive variants (sm:, md:, lg:) to scale up
   *
   * Format: [fontSize, { lineHeight, letterSpacing? }]
   */
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }], // 12px - Captions, labels
    sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px - Secondary text
    base: ['1rem', { lineHeight: '1.5rem' }], // 16px - Body text (default)
    lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px - Subheadings
    xl: ['1.25rem', { lineHeight: '1.75rem' }], // 20px - Card titles
    '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px - Section headings
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px - Page headings
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px - Hero text (balance display)
    '5xl': ['3rem', { lineHeight: '1' }], // 48px - Large numbers
  },

  /**
   * Font Weights
   * Inter supports 100-900, but we use semantic values
   */
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  /**
   * Letter Spacing
   * Subtle adjustments for better readability
   */
  letterSpacing: {
    tight: '-0.025em', // For large headings
    normal: '0em', // Default
    wide: '0.025em', // For uppercase text, buttons
  },

  /**
   * Line Heights
   * Semantic values for different content types
   */
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
} as const;

/**
 * Typography Token Type
 */
export type TypographyToken = typeof typography;
