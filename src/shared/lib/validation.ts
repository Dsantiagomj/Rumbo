import { z } from 'zod';

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
  .min(1, 'El nombre del archivo es requerido')
  .max(255, 'El nombre del archivo es muy largo')
  .regex(/\.(csv|pdf|png|jpg|jpeg)$/i, 'Formato de archivo no válido')
  .transform(sanitizeFilename);

/**
 * Validated base64 string
 */
export const base64Schema = z
  .string()
  .min(1, 'El contenido del archivo es requerido')
  .max(10 * 1024 * 1024, 'El archivo es demasiado grande (máx 10MB)') // ~7.5MB actual size
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
 * Range: -1 billion to +1 billion
 */
export const amountSchema = z
  .number()
  .min(-1_000_000_000, 'Monto demasiado pequeño')
  .max(1_000_000_000, 'Monto demasiado grande')
  .refine((val) => !isNaN(val) && isFinite(val), 'Monto inválido');

/**
 * Balance validation (must be non-negative or within reasonable range)
 */
export const balanceSchema = z
  .number()
  .min(-1_000_000_000, 'Balance demasiado pequeño')
  .max(1_000_000_000, 'Balance demasiado grande')
  .refine((val) => !isNaN(val) && isFinite(val), 'Balance inválido');

/**
 * Date validation (must be within reasonable range)
 * Min: 100 years ago
 * Max: 10 years in future
 */
export const dateSchema = z
  .date()
  .min(new Date(Date.now() - 100 * 365 * 24 * 60 * 60 * 1000), 'Fecha demasiado antigua')
  .max(
    new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
    'Fecha demasiado lejana en el futuro',
  );

/**
 * Transaction description validation
 * Max 500 characters, sanitized for XSS
 */
export const descriptionSchema = z
  .string()
  .min(1, 'La descripción es requerida')
  .max(500, 'La descripción es muy larga')
  .transform(sanitizeText);

/**
 * Account name validation
 * Min 2, Max 100 characters, sanitized
 */
export const accountNameSchema = z
  .string()
  .min(2, 'El nombre de la cuenta es muy corto')
  .max(100, 'El nombre de la cuenta es muy largo')
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
