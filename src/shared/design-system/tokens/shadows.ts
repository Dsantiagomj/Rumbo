/**
 * Rumbo Shadow System
 * Subtle elevations for depth and hierarchy
 *
 * Usage:
 * - Cards, modals, dropdowns for elevation
 * - Avoid excessive shadows (keep UI clean)
 * - Use sparingly for focus/emphasis
 *
 * @example
 * import { shadows } from '@/shared/design-system/tokens';
 * <div style={{ boxShadow: shadows.md }}>Card</div>
 */

export const shadows = {
  /**
   * No shadow
   */
  none: 'none',

  /**
   * Extra small shadow
   * Use for: Subtle hover states, minimal depth
   */
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',

  /**
   * Small shadow
   * Use for: Buttons, input focus, subtle cards
   */
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',

  /**
   * Default shadow
   * Use for: Cards, transaction items
   */
  DEFAULT: '0 2px 4px 0 rgb(0 0 0 / 0.1), 0 2px 3px -1px rgb(0 0 0 / 0.1)',

  /**
   * Medium shadow
   * Use for: Elevated cards, dropdown menus
   */
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',

  /**
   * Large shadow
   * Use for: Modals, popovers, important cards
   */
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',

  /**
   * Extra large shadow
   * Use for: Floating action buttons, key modals
   */
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',

  /**
   * 2X extra large shadow
   * Use for: Hero elements, splash screens
   */
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',

  /**
   * Inner shadow
   * Use for: Inset buttons, pressed states
   */
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',

  /**
   * Colored shadows for emphasis
   * Use sparingly for brand elements
   */
  colored: {
    primary: '0 10px 15px -3px rgb(59 130 246 / 0.3)',
    success: '0 10px 15px -3px rgb(16 185 129 / 0.3)',
    danger: '0 10px 15px -3px rgb(239 68 68 / 0.3)',
  },
} as const;

/**
 * Shadow Token Type
 */
export type ShadowToken = typeof shadows;
