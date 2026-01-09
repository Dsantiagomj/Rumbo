/**
 * Date Formatting Utilities
 * Optimized for Colombian locale (es-CO) and timezone (America/Bogota)
 *
 * @example
 * import { formatDate, formatRelativeTime } from '@/shared/lib/utils';
 *
 * formatDate(new Date()); // "09/01/2026"
 * formatRelativeTime(new Date()); // "hace 5 minutos"
 */

import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Format date for Colombian context
 *
 * @param date - Date object or ISO string
 * @param formatStr - date-fns format string
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date()); // "09/01/2026" (DD/MM/YYYY)
 * formatDate(new Date(), 'PPP'); // "9 de enero de 2026"
 * formatDate('2026-01-09'); // "09/01/2026"
 */
export function formatDate(date: Date | string, formatStr: string = 'dd/MM/yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: es });
}

/**
 * Format datetime with time
 *
 * @param date - Date object or ISO string
 * @returns Formatted datetime string
 *
 * @example
 * formatDateTime(new Date()); // "09/01/2026 14:30"
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: es });
}

/**
 * Format time only (24h format)
 *
 * @param date - Date object or ISO string
 * @returns Formatted time string
 *
 * @example
 * formatTime(new Date()); // "14:30"
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'HH:mm', { locale: es });
}

/**
 * Format relative time (e.g., "hace 5 minutos")
 *
 * @param date - Date object or ISO string
 * @returns Relative time string in Spanish
 *
 * @example
 * formatRelativeTime(new Date()); // "hace unos segundos"
 * formatRelativeTime(subMinutes(new Date(), 5)); // "hace 5 minutos"
 * formatRelativeTime(subHours(new Date(), 2)); // "hace 2 horas"
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (isToday(dateObj)) {
    return 'Hoy';
  }

  if (isYesterday(dateObj)) {
    return 'Ayer';
  }

  return formatDistanceToNow(dateObj, {
    locale: es,
    addSuffix: true,
  });
}

/**
 * Format date for transaction lists (smart formatting)
 * Shows "Hoy", "Ayer", or formatted date
 *
 * @param date - Date object or ISO string
 * @returns Smart formatted date string
 *
 * @example
 * formatTransactionDate(new Date()); // "Hoy"
 * formatTransactionDate(subDays(new Date(), 1)); // "Ayer"
 * formatTransactionDate(subDays(new Date(), 7)); // "02/01/2026"
 */
export function formatTransactionDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (isToday(dateObj)) {
    return 'Hoy';
  }

  if (isYesterday(dateObj)) {
    return 'Ayer';
  }

  return format(dateObj, 'dd/MM/yyyy', { locale: es });
}

/**
 * Format date for display (long format)
 *
 * @param date - Date object or ISO string
 * @returns Long formatted date string
 *
 * @example
 * formatLongDate(new Date()); // "9 de enero de 2026"
 */
export function formatLongDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'PPP', { locale: es });
}

/**
 * Format month and year
 *
 * @param date - Date object or ISO string
 * @returns Month and year string
 *
 * @example
 * formatMonthYear(new Date()); // "enero 2026"
 */
export function formatMonthYear(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMMM yyyy', { locale: es });
}

/**
 * Format month name only
 *
 * @param date - Date object or ISO string
 * @returns Month name
 *
 * @example
 * formatMonth(new Date()); // "enero"
 */
export function formatMonth(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMMM', { locale: es });
}

/**
 * Get start and end of current month (for queries)
 *
 * @returns Object with startOfMonth and endOfMonth dates
 *
 * @example
 * const { startOfMonth, endOfMonth } = getCurrentMonthRange();
 */
export function getCurrentMonthRange() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  return { startOfMonth, endOfMonth };
}

/**
 * Check if date is in current month
 *
 * @param date - Date object or ISO string
 * @returns Boolean indicating if date is in current month
 */
export function isCurrentMonth(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();

  return dateObj.getMonth() === now.getMonth() && dateObj.getFullYear() === now.getFullYear();
}
