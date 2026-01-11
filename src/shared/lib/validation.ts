import { z } from 'zod';
import { VALIDATION, FINANCIAL, DATE_RANGES, FILE_UPLOAD } from '@/shared/constants';

/**
 * Validation utilities for input sanitization and validation
 */

// ===== String Sanitization =====

/**
 * Remove HTML tags and potentially dangerous characters
 * Prevents XSS attacks by stripping HTML/script tags
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
}

/**
 * Sanitize filename to prevent path traversal attacks
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[/\\]/g, '') // Remove path separators
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/[<>:"|?*]/g, '') // Remove invalid filename characters
    .trim();
}

/**
 * Sanitize user-generated text (descriptions, notes)
 * More permissive than sanitizeString but still safe
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .trim();
}

// ===== Zod Schemas with Validation =====

/**
 * Validated and sanitized string
 * Default max length: 255 characters
 */
export const sanitizedString = (options?: { min?: number; max?: number; message?: string }) => {
  const min = options?.min ?? 1;
  const max = options?.max ?? 255;

  return z
    .string()
    .min(min, options?.message ?? `Debe tener al menos ${min} caracteres`)
    .max(max, `Debe tener máximo ${max} caracteres`)
    .transform(sanitizeString);
};

/**
 * Validated filename
 */
export const filenameSchema = z
  .string()
  .min(VALIDATION.MIN_STRING_LENGTH, 'El nombre del archivo es requerido')
  .max(VALIDATION.MAX_STRING_LENGTH, 'El nombre del archivo es muy largo')
  .regex(/\.(csv|pdf|png|jpg|jpeg)$/i, 'Formato de archivo no válido')
  .transform(sanitizeFilename);

/**
 * Validated base64 string
 */
export const base64Schema = z
  .string()
  .min(VALIDATION.MIN_STRING_LENGTH, 'El contenido del archivo es requerido')
  .max(FILE_UPLOAD.MAX_FILE_SIZE, 'El archivo es demasiado grande (máx 10MB)')
  .regex(/^[A-Za-z0-9+/]*={0,2}$/, 'Contenido de archivo inválido');

/**
 * Array schema with size limits
 */
export const limitedArray = <T extends z.ZodTypeAny>(
  itemSchema: T,
  options?: { min?: number; max?: number },
) => {
  const min = options?.min ?? 0;
  const max = options?.max ?? 10000;

  return z
    .array(itemSchema)
    .min(min, `Debe tener al menos ${min} elementos`)
    .max(max, `Debe tener máximo ${max} elementos`);
};

/**
 * Transaction amount validation
 * Allows negative for expenses, positive for income
 */
export const amountSchema = z
  .number()
  .min(FINANCIAL.MIN_AMOUNT, 'Monto demasiado pequeño')
  .max(FINANCIAL.MAX_AMOUNT, 'Monto demasiado grande')
  .refine((val) => !isNaN(val) && isFinite(val), 'Monto inválido');

/**
 * Balance validation (must be non-negative or within reasonable range)
 */
export const balanceSchema = z
  .number()
  .min(FINANCIAL.MIN_BALANCE, 'Balance demasiado pequeño')
  .max(FINANCIAL.MAX_BALANCE, 'Balance demasiado grande')
  .refine((val) => !isNaN(val) && isFinite(val), 'Balance inválido');

/**
 * Date validation (must be within reasonable range)
 */
export const dateSchema = z
  .date()
  .min(
    new Date(Date.now() - DATE_RANGES.MAX_YEARS_PAST * 365 * DATE_RANGES.DAY_MS),
    'Fecha demasiado antigua',
  )
  .max(
    new Date(Date.now() + DATE_RANGES.MAX_YEARS_FUTURE * 365 * DATE_RANGES.DAY_MS),
    'Fecha demasiado lejana en el futuro',
  );

/**
 * Transaction description validation
 * Sanitized for XSS
 */
export const descriptionSchema = z
  .string()
  .min(VALIDATION.MIN_STRING_LENGTH, 'La descripción es requerida')
  .max(VALIDATION.MAX_DESCRIPTION_LENGTH, 'La descripción es muy larga')
  .transform(sanitizeText);

/**
 * Account name validation
 * Sanitized
 */
export const accountNameSchema = z
  .string()
  .min(VALIDATION.MIN_ACCOUNT_NAME_LENGTH, 'El nombre de la cuenta es muy corto')
  .max(VALIDATION.MAX_ACCOUNT_NAME_LENGTH, 'El nombre de la cuenta es muy largo')
  .transform(sanitizeString);

// ===== Additional Validators =====

/**
 * Check if a value is a valid positive integer
 */
export const positiveIntegerSchema = z
  .number()
  .int('Debe ser un número entero')
  .positive('Debe ser un número positivo');

/**
 * Check if a value is a valid percentage (0-100)
 */
export const percentageSchema = z
  .number()
  .min(0, 'El porcentaje no puede ser negativo')
  .max(100, 'El porcentaje no puede ser mayor a 100');
