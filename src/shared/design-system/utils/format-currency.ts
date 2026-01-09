/**
 * Currency Formatting Utilities
 * Optimized for Colombian Peso (COP) and multi-currency support
 *
 * @example
 * import { formatCurrency, formatCompactCurrency } from '@/shared/lib/utils';
 *
 * formatCurrency(1234567.89); // "$1.234.567,89"
 * formatCompactCurrency(1500000); // "$1,5 M"
 */

/**
 * Format currency for Colombian Peso (COP) or other currencies
 *
 * @param amount - The numeric amount to format
 * @param currency - Currency code (ISO 4217)
 * @param options - Additional Intl.NumberFormat options
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1234567.89, 'COP'); // "$1.234.567,89"
 * formatCurrency(1234.56, 'USD'); // "$1,234.56"
 * formatCurrency(1234.56, 'EUR'); // "€1.234,56"
 */
export function formatCurrency(
  amount: number,
  currency: 'COP' | 'USD' | 'EUR' = 'COP',
  options?: Intl.NumberFormatOptions,
): string {
  // Colombian locale for COP, en-US for others
  const locale = currency === 'COP' ? 'es-CO' : 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);
}

/**
 * Format compact currency (for charts, cards, mobile)
 *
 * @param amount - The numeric amount to format
 * @param currency - Currency code (ISO 4217)
 * @returns Compact formatted currency string
 *
 * @example
 * formatCompactCurrency(1500000, 'COP'); // "$1,5 M"
 * formatCompactCurrency(50000, 'COP');   // "$50 mil"
 * formatCompactCurrency(500, 'COP');     // "$500"
 */
export function formatCompactCurrency(
  amount: number,
  currency: 'COP' | 'USD' | 'EUR' = 'COP',
): string {
  const locale = currency === 'COP' ? 'es-CO' : 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

/**
 * Format currency without symbol (useful for inputs)
 *
 * @param amount - The numeric amount to format
 * @param currency - Currency code (ISO 4217)
 * @returns Formatted number string without currency symbol
 *
 * @example
 * formatCurrencyWithoutSymbol(1234567.89, 'COP'); // "1.234.567,89"
 */
export function formatCurrencyWithoutSymbol(
  amount: number,
  currency: 'COP' | 'USD' | 'EUR' = 'COP',
): string {
  const locale = currency === 'COP' ? 'es-CO' : 'en-US';

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Parse currency string to number (removes formatting)
 *
 * @param currencyString - Formatted currency string
 * @param currency - Currency code (for locale detection)
 * @returns Numeric value
 *
 * @example
 * parseCurrency("$1.234.567,89", 'COP'); // 1234567.89
 * parseCurrency("$1,234.56", 'USD');     // 1234.56
 */
export function parseCurrency(
  currencyString: string,
  currency: 'COP' | 'USD' | 'EUR' = 'COP',
): number {
  // Remove currency symbol and whitespace
  let cleaned = currencyString.replace(/[^0-9.,-]/g, '');

  // Handle Colombian format (period as thousands separator, comma as decimal)
  if (currency === 'COP') {
    cleaned = cleaned.replace(/\./g, '').replace(/,/, '.');
  } else {
    // US/EU format (comma as thousands separator, period as decimal)
    cleaned = cleaned.replace(/,/g, '');
  }

  return parseFloat(cleaned) || 0;
}

/**
 * Format percentage
 *
 * @param value - Numeric value (0-1 for percentages, or raw percentage)
 * @param decimals - Number of decimal places
 * @param fromFraction - If true, treats value as 0-1 (e.g., 0.15 = 15%)
 * @returns Formatted percentage string
 *
 * @example
 * formatPercentage(0.15, 1, true); // "15,0%"
 * formatPercentage(85.5, 1);       // "85,5%"
 */
export function formatPercentage(
  value: number,
  decimals: number = 1,
  fromFraction: boolean = false,
): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(fromFraction ? value : value / 100);
}
