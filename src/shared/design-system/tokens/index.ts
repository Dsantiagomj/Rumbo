/**
 * Rumbo Design Tokens
 * Central export for all design tokens
 *
 * @example
 * import { colors, typography, spacing, shadows } from '@/shared/design-system/tokens';
 *
 * // Use in components
 * const primaryColor = colors.brand.primary[500];
 * const baseFont = typography.fontFamily.sans;
 */

export { colors, type ColorToken, type CategoryKey } from './colors';
export { typography, type TypographyToken } from './typography';
export { spacing, type SpacingToken } from './spacing';
export { shadows, type ShadowToken } from './shadows';

import { colors as colorsImport } from './colors';
import { typography as typographyImport } from './typography';
import { spacing as spacingImport } from './spacing';
import { shadows as shadowsImport } from './shadows';

/**
 * All tokens combined
 * Use when you need access to all tokens
 */
export const tokens = {
  colors: colorsImport,
  typography: typographyImport,
  spacing: spacingImport,
  shadows: shadowsImport,
} as const;

export type DesignTokens = typeof tokens;
