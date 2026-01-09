/**
 * Number Formatting Utilities
 * For general number formatting (non-currency)
 *
 * @example
 * import { formatNumber, formatCompactNumber } from '@/shared/lib/utils';
 *
 * formatNumber(1234567); // "1.234.567"
 * formatCompactNumber(1500000); // "1,5 M"
 */

/**
 * Format number with Colombian locale (period as thousands separator)
 *
 * @param value - Numeric value to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1234567); // "1.234.567"
 * formatNumber(1234.5678, 2); // "1.234,57"
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format compact number (for large numbers)
 *
 * @param value - Numeric value to format
 * @returns Compact formatted number string
 *
 * @example
 * formatCompactNumber(1500000); // "1,5 M"
 * formatCompactNumber(50000); // "50 mil"
 * formatCompactNumber(500); // "500"
 */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format number with sign (always show + or -)
 *
 * @param value - Numeric value to format
 * @param decimals - Number of decimal places
 * @returns Formatted number with sign
 *
 * @example
 * formatNumberWithSign(1234); // "+1.234"
 * formatNumberWithSign(-1234); // "-1.234"
 */
export function formatNumberWithSign(value: number, decimals: number = 0): string {
  const sign = value >= 0 ? '+' : '';
  return sign + formatNumber(value, decimals);
}

/**
 * Round to nearest value (useful for charts)
 *
 * @param value - Numeric value to round
 * @param nearest - Round to nearest this value
 * @returns Rounded number
 *
 * @example
 * roundToNearest(1234, 100); // 1200
 * roundToNearest(1278, 100); // 1300
 * roundToNearest(1234, 1000); // 1000
 */
export function roundToNearest(value: number, nearest: number): number {
  return Math.round(value / nearest) * nearest;
}

/**
 * Clamp number between min and max
 *
 * @param value - Numeric value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped number
 *
 * @example
 * clamp(150, 0, 100); // 100
 * clamp(-10, 0, 100); // 0
 * clamp(50, 0, 100); // 50
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
