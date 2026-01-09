/**
 * Rumbo Design System Utilities
 * Central export for all utility functions
 *
 * @example
 * import { formatCurrency, formatDate, cn } from '@/shared/lib/utils';
 */

// Currency formatting
export {
  formatCurrency,
  formatCompactCurrency,
  formatCurrencyWithoutSymbol,
  parseCurrency,
  formatPercentage,
} from './format-currency';

// Date formatting
export {
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  formatTransactionDate,
  formatLongDate,
  formatMonthYear,
  formatMonth,
  getCurrentMonthRange,
  isCurrentMonth,
} from './format-date';

// Number formatting
export {
  formatNumber,
  formatCompactNumber,
  formatNumberWithSign,
  roundToNearest,
  clamp,
} from './format-number';
