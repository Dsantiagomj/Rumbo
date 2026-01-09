/**
 * Design Tokens for React Native
 * Compatible with React Native Reusables and Expo
 *
 * This file exports design tokens as plain JavaScript objects
 * (no CSS variables) for use in React Native applications.
 *
 * Usage in Expo (v4+):
 * ```typescript
 * import { nativeTokens } from '@/shared/design-system/tokens-native';
 * const { colors, spacing } = nativeTokens;
 * ```
 *
 * @see https://reactnativereusables.com
 */

/**
 * Convert oklch colors to hex (for React Native compatibility)
 * These are approximations of the oklch values from colors.ts
 */
export const nativeTokens = {
  /**
   * Brand Colors
   */
  colors: {
    brand: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6', // Main blue
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
      },
      secondary: {
        50: '#faf5ff',
        100: '#f3e8ff',
        200: '#e9d5ff',
        300: '#d8b4fe',
        400: '#c084fc',
        500: '#a855f7', // Purple (AI)
        600: '#9333ea',
        700: '#7e22ce',
        800: '#6b21a8',
        900: '#581c87',
      },
    },

    /**
     * Financial Semantic Colors
     */
    financial: {
      positive: {
        500: '#10b981', // Green (income/savings)
        600: '#059669',
      },
      negative: {
        500: '#ef4444', // Red (expenses/debt)
        600: '#dc2626',
      },
      neutral: {
        500: '#6b7280', // Gray
      },
      warning: {
        500: '#f59e0b', // Amber
      },
    },

    /**
     * Category Colors (Colombian Context)
     */
    categories: {
      food: '#f97316', // Orange
      transport: '#3b82f6', // Blue
      bills: '#facc15', // Yellow
      entertainment: '#a855f7', // Purple
      health: '#ef4444', // Red
      education: '#10b981', // Green
      personal: '#ec4899', // Pink
      debt: '#6b7280', // Gray
      savings: '#10b981', // Emerald
      other: '#64748b', // Slate
    },

    /**
     * UI Colors (matching web)
     */
    background: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      tertiary: '#f3f4f6',
    },
    text: {
      primary: '#111827',
      secondary: '#6b7280',
      tertiary: '#9ca3af',
      inverse: '#ffffff',
    },
    border: {
      default: '#e5e7eb',
      focus: '#3b82f6',
    },
  },

  /**
   * Spacing Scale
   * React Native uses numeric values (no rem/px units)
   */
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16, // Base unit
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,

    /**
     * Touch Targets
     */
    touchMin: 44, // iOS minimum
    touchComfortable: 48, // Material Design
  },

  /**
   * Typography
   * React Native uses font family names directly
   */
  typography: {
    fontFamily: {
      sans: 'Inter', // Configure in app.json or expo config
      mono: 'Courier',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  /**
   * Border Radius
   */
  borderRadius: {
    none: 0,
    sm: 6,
    md: 8,
    lg: 10,
    xl: 12,
    '2xl': 16,
    '3xl': 20,
    full: 9999,
  },

  /**
   * Shadows (React Native shadow props)
   */
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2, // Android
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
  },
} as const;

export type NativeTokens = typeof nativeTokens;

/**
 * Helper function to apply shadow
 * React Native requires separate props for iOS and Android
 *
 * @example
 * <View style={applyShadow('md')}>...</View>
 */
export function applyShadow(size: keyof typeof nativeTokens.shadows) {
  return nativeTokens.shadows[size];
}
