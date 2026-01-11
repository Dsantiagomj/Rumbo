/**
 * Application-wide constants
 * Centralized magic numbers and configuration values
 */

// ===== Time & Durations =====
export const TIME = {
  /** Success message display duration (ms) */
  SUCCESS_MESSAGE_DURATION: 3000,
  /** Debounce delay for search inputs (ms) */
  SEARCH_DEBOUNCE: 300,
  /** React Query stale time for cached data (ms) */
  QUERY_STALE_TIME: 5 * 60 * 1000, // 5 minutes
  /** Session timeout warning (ms) */
  SESSION_WARNING_TIME: 5 * 60 * 1000, // 5 minutes before expiry
  /** Ripple animation duration (ms) */
  RIPPLE_DURATION: 600,
} as const;

// ===== Pagination & Limits =====
export const PAGINATION = {
  /** Default page size for transactions */
  DEFAULT_PAGE_SIZE: 50,
  /** Maximum page size allowed */
  MAX_PAGE_SIZE: 100,
  /** Minimum page size */
  MIN_PAGE_SIZE: 10,
  /** Initial transactions to show in account details */
  INITIAL_TRANSACTION_COUNT: 10,
  /** Maximum transactions per import */
  MAX_IMPORT_TRANSACTIONS: 10000,
  /** Maximum transactions for AI categorization */
  MAX_AI_CATEGORIZATION: 1000,
  /** Maximum PDF pages to process */
  MAX_PDF_PAGES: 50,
} as const;

// ===== File Upload =====
export const FILE_UPLOAD = {
  /** Maximum file size in bytes (10MB) */
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  /** Supported CSV MIME type */
  CSV_MIME_TYPE: 'text/csv',
  /** Supported PDF MIME type */
  PDF_MIME_TYPE: 'application/pdf',
  /** PDF to image scale factor */
  PDF_SCALE: 2.0,
} as const;

// ===== Validation =====
export const VALIDATION = {
  /** Minimum string length */
  MIN_STRING_LENGTH: 1,
  /** Maximum string length (general) */
  MAX_STRING_LENGTH: 255,
  /** Maximum description length */
  MAX_DESCRIPTION_LENGTH: 500,
  /** Maximum account name length */
  MAX_ACCOUNT_NAME_LENGTH: 100,
  /** Minimum account name length */
  MIN_ACCOUNT_NAME_LENGTH: 2,
  /** Maximum search term length */
  MAX_SEARCH_LENGTH: 200,
  /** Minimum password length */
  MIN_PASSWORD_LENGTH: 8,
  /** Maximum password length */
  MAX_PASSWORD_LENGTH: 128,
  /** Minimum name length */
  MIN_NAME_LENGTH: 2,
  /** Maximum name length */
  MAX_NAME_LENGTH: 100,
  /** Minimum ID length (for identification numbers) */
  MIN_ID_LENGTH: 6,
  /** Maximum ID length */
  MAX_ID_LENGTH: 15,
} as const;

// ===== Financial Limits =====
export const FINANCIAL = {
  /** Maximum transaction amount (1 billion) */
  MAX_AMOUNT: 1_000_000_000,
  /** Minimum transaction amount (-1 billion) */
  MIN_AMOUNT: -1_000_000_000,
  /** Maximum balance */
  MAX_BALANCE: 1_000_000_000,
  /** Minimum balance */
  MIN_BALANCE: -1_000_000_000,
} as const;

// ===== AI & Confidence =====
export const AI = {
  /** Minimum confidence threshold for auto-categorization */
  MIN_CONFIDENCE: 0.5,
  /** High confidence threshold */
  HIGH_CONFIDENCE: 0.8,
  /** Medium confidence threshold */
  MEDIUM_CONFIDENCE: 0.6,
  /** Categorization confidence threshold for clarity */
  CLEAR_CATEGORY_THRESHOLD: 0.7,
  /** Temperature for GPT categorization */
  GPT_TEMPERATURE: 0.3,
  /** Temperature for GPT reconciliation */
  GPT_RECONCILIATION_TEMP: 0.3,
} as const;

// ===== Dates =====
export const DATE_RANGES = {
  /** Maximum years in the past for date validation */
  MAX_YEARS_PAST: 100,
  /** Maximum years in the future for date validation */
  MAX_YEARS_FUTURE: 10,
  /** Minimum age requirement (years) */
  MIN_AGE: 13,
  /** Maximum age for validation (years) */
  MAX_AGE: 120,
  /** Days in milliseconds */
  DAY_MS: 24 * 60 * 60 * 1000,
  /** Duplicate transaction date tolerance (ms) - 1 day */
  DUPLICATE_DATE_TOLERANCE: 86400000,
} as const;

// ===== UI & Animation =====
export const UI = {
  /** Minimum touch target size (px) for accessibility */
  MIN_TOUCH_TARGET: 44,
  /** Preferred touch target size (px) */
  PREFERRED_TOUCH_TARGET: 48,
  /** Loading skeleton count for lists */
  SKELETON_COUNT: 3,
  /** Toast notification duration (ms) */
  TOAST_DURATION: 5000,
  /** Default animation duration (ms) */
  ANIMATION_DURATION: 300,
  /** Long animation duration (ms) */
  LONG_ANIMATION_DURATION: 500,
  /** Icon size small (px) */
  ICON_SIZE_SM: 16,
  /** Icon size medium (px) */
  ICON_SIZE_MD: 20,
  /** Icon size large (px) */
  ICON_SIZE_LG: 24,
} as const;

// ===== Retry & Error Handling =====
export const RETRY = {
  /** Maximum retry attempts for mutations */
  MAX_ATTEMPTS: 2, // Total 3 attempts (initial + 2 retries)
  /** Initial retry delay (ms) */
  INITIAL_DELAY: 1000,
  /** Maximum retry delay (ms) */
  MAX_DELAY: 30000,
  /** Exponential backoff base */
  BACKOFF_BASE: 2,
} as const;

// ===== Defaults =====
export const DEFAULTS = {
  /** Default currency */
  CURRENCY: 'COP' as const,
  /** Default language */
  LANGUAGE: 'es-CO' as const,
  /** Default date format */
  DATE_FORMAT: 'DD/MM/YYYY' as const,
  /** Default timezone */
  TIMEZONE: 'America/Bogota',
  /** Default account type */
  ACCOUNT_TYPE: 'SAVINGS' as const,
} as const;

// ===== Feature Flags =====
export const FEATURES = {
  /** Enable AI categorization */
  AI_CATEGORIZATION: true,
  /** Enable AI reconciliation */
  AI_RECONCILIATION: true,
  /** Enable PDF import */
  PDF_IMPORT: true,
  /** Enable multi-page PDF */
  MULTI_PAGE_PDF: true,
  /** Enable duplicate detection */
  DUPLICATE_DETECTION: true,
} as const;

// ===== Environment =====
export const ENV = {
  /** Is production environment */
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  /** Is development environment */
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  /** Is test environment */
  IS_TEST: process.env.NODE_ENV === 'test',
} as const;
