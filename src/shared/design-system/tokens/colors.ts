/**
 * Rumbo Color Palette
 * Multi-platform design tokens for consistent branding
 *
 * Format: oklch (perceptually uniform, better for dark mode)
 * Usage: Import tokens and use with Tailwind utilities
 *
 * @example
 * import { colors } from '@/shared/design-system/tokens';
 * <div className="bg-brand-primary-500">Primary</div>
 */

export const colors = {
  /**
   * Brand Colors
   * Primary: Blue (trust, professional)
   * Secondary: Purple (innovation, AI)
   */
  brand: {
    primary: {
      50: 'oklch(0.97 0.02 250)',
      100: 'oklch(0.92 0.05 250)',
      200: 'oklch(0.85 0.10 250)',
      300: 'oklch(0.75 0.15 250)',
      400: 'oklch(0.67 0.19 250)',
      500: 'oklch(0.59 0.22 250)', // Main blue
      600: 'oklch(0.52 0.23 250)',
      700: 'oklch(0.45 0.21 250)',
      800: 'oklch(0.38 0.18 250)',
      900: 'oklch(0.30 0.14 250)',
    },
    secondary: {
      50: 'oklch(0.95 0.05 290)',
      100: 'oklch(0.90 0.10 290)',
      200: 'oklch(0.82 0.17 290)',
      300: 'oklch(0.74 0.21 290)',
      400: 'oklch(0.69 0.24 290)',
      500: 'oklch(0.65 0.25 290)', // Purple (AI)
      600: 'oklch(0.58 0.24 290)',
      700: 'oklch(0.51 0.21 290)',
      800: 'oklch(0.44 0.18 290)',
      900: 'oklch(0.36 0.14 290)',
    },
  },

  /**
   * Financial Semantic Colors
   * Used for transaction amounts and financial states
   */
  financial: {
    positive: {
      50: 'oklch(0.95 0.03 145)',
      100: 'oklch(0.88 0.08 145)',
      200: 'oklch(0.80 0.12 145)',
      300: 'oklch(0.73 0.15 145)',
      400: 'oklch(0.69 0.17 145)',
      500: 'oklch(0.65 0.18 145)', // Green (income/savings)
      600: 'oklch(0.57 0.17 145)',
      700: 'oklch(0.49 0.15 145)',
      800: 'oklch(0.41 0.12 145)',
      900: 'oklch(0.33 0.09 145)',
    },
    negative: {
      50: 'oklch(0.96 0.04 27)',
      100: 'oklch(0.91 0.10 27)',
      200: 'oklch(0.84 0.16 27)',
      300: 'oklch(0.75 0.20 27)',
      400: 'oklch(0.69 0.23 27)',
      500: 'oklch(0.63 0.24 27)', // Red (expenses/debt)
      600: 'oklch(0.55 0.23 27)',
      700: 'oklch(0.47 0.20 27)',
      800: 'oklch(0.39 0.17 27)',
      900: 'oklch(0.31 0.13 27)',
    },
    neutral: {
      50: 'oklch(0.97 0.00 240)',
      100: 'oklch(0.92 0.01 240)',
      200: 'oklch(0.84 0.01 240)',
      300: 'oklch(0.74 0.02 240)',
      400: 'oklch(0.64 0.02 240)',
      500: 'oklch(0.55 0.02 240)', // Gray (neutral transactions)
      600: 'oklch(0.46 0.02 240)',
      700: 'oklch(0.38 0.01 240)',
      800: 'oklch(0.30 0.01 240)',
      900: 'oklch(0.22 0.00 240)',
    },
    warning: {
      50: 'oklch(0.96 0.03 70)',
      100: 'oklch(0.91 0.08 70)',
      200: 'oklch(0.86 0.12 70)',
      300: 'oklch(0.83 0.14 70)',
      400: 'oklch(0.80 0.15 70)',
      500: 'oklch(0.78 0.16 70)', // Amber (alerts, budget limits)
      600: 'oklch(0.69 0.15 70)',
      700: 'oklch(0.59 0.13 70)',
      800: 'oklch(0.49 0.11 70)',
      900: 'oklch(0.40 0.08 70)',
    },
  },

  /**
   * Category Colors (Colombian Context)
   * Each transaction category has a distinct color for visual recognition
   */
  categories: {
    food: 'oklch(0.75 0.19 45)', // Orange (Alimentación)
    transport: 'oklch(0.63 0.22 250)', // Blue (Transporte)
    bills: 'oklch(0.82 0.18 95)', // Yellow (Servicios)
    entertainment: 'oklch(0.68 0.25 290)', // Purple (Entretenimiento)
    health: 'oklch(0.65 0.24 15)', // Red (Salud)
    education: 'oklch(0.62 0.17 145)', // Green (Educación)
    personal: 'oklch(0.72 0.22 350)', // Pink (Personal)
    debt: 'oklch(0.50 0.02 240)', // Gray (Deudas)
    savings: 'oklch(0.67 0.19 165)', // Emerald (Ahorro)
    other: 'oklch(0.58 0.02 240)', // Slate (Otros)
  },
} as const;

/**
 * Color Token Type
 * Use for type-safe color references
 */
export type ColorToken = typeof colors;

/**
 * Category Keys
 * Union type of all available categories
 */
export type CategoryKey = keyof typeof colors.categories;
