/**
 * Rumbo Spacing Scale
 * Based on 4px base unit for consistent spacing
 *
 * Why 4px base?
 * - Aligns with 44px minimum touch target (11 × 4px)
 * - Creates predictable, harmonious spacing
 * - Works well at all screen sizes
 *
 * @example
 * import { spacing } from '@/shared/design-system/tokens';
 * <div style={{ padding: spacing[4] }}>Content</div>
 */

export const spacing = {
  /**
   * Base Scale (4px increments)
   * Use for margins, paddings, gaps
   */
  0: '0',
  0.5: '0.125rem', // 2px - Fine adjustments
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px - Base unit
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px - Minimum touch target
  12: '3rem', // 48px - Comfortable touch target
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
  36: '9rem', // 144px
  40: '10rem', // 160px
  44: '11rem', // 176px
  48: '12rem', // 192px
  52: '13rem', // 208px
  56: '14rem', // 224px
  60: '15rem', // 240px
  64: '16rem', // 256px
  72: '18rem', // 288px
  80: '20rem', // 320px
  96: '24rem', // 384px

  /**
   * Touch Targets
   * iOS and Android minimum touch targets
   */
  touchMin: '2.75rem', // 44px - iOS minimum
  touchComfortable: '3rem', // 48px - Material Design recommended
  touchGenerous: '3.5rem', // 56px - Large buttons

  /**
   * Layout Spacing
   * Common layout patterns
   */
  containerPadding: {
    mobile: '1rem', // 16px
    tablet: '1.5rem', // 24px
    desktop: '2rem', // 32px
  },
  sectionSpacing: {
    mobile: '2rem', // 32px
    tablet: '3rem', // 48px
    desktop: '4rem', // 64px
  },
  cardPadding: {
    mobile: '1rem', // 16px
    desktop: '1.5rem', // 24px
  },

  /**
   * Component Spacing
   * Specific component measurements
   */
  buttonPadding: {
    sm: '0.5rem 0.75rem', // 8px 12px
    md: '0.625rem 1rem', // 10px 16px
    lg: '0.75rem 1.5rem', // 12px 24px
  },
  inputHeight: {
    sm: '2.25rem', // 36px
    md: '2.5rem', // 40px
    lg: '2.75rem', // 44px
  },
} as const;

/**
 * Spacing Token Type
 */
export type SpacingToken = typeof spacing;
