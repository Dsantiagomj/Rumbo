/**
 * CategoryIcon Component
 * Displays category icon with consistent colors
 *
 * @example
 * import { CategoryIcon } from '@/shared/components/rumbo';
 * <CategoryIcon category="FOOD" size="md" />
 */

import {
  ShoppingCart,
  Bus,
  Lightbulb,
  Film,
  Heart,
  GraduationCap,
  User,
  CreditCard,
  PiggyBank,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

/**
 * Category configuration
 * Maps category keys to icons and colors
 */
const CATEGORY_CONFIG = {
  FOOD: {
    icon: ShoppingCart,
    color: 'bg-category-food/10 text-category-food dark:bg-category-food/20',
    label: 'Alimentación',
  },
  TRANSPORT: {
    icon: Bus,
    color: 'bg-category-transport/10 text-category-transport dark:bg-category-transport/20',
    label: 'Transporte',
  },
  BILLS: {
    icon: Lightbulb,
    color: 'bg-category-bills/10 text-category-bills dark:bg-category-bills/20',
    label: 'Servicios',
  },
  ENTERTAINMENT: {
    icon: Film,
    color:
      'bg-category-entertainment/10 text-category-entertainment dark:bg-category-entertainment/20',
    label: 'Entretenimiento',
  },
  HEALTH: {
    icon: Heart,
    color: 'bg-category-health/10 text-category-health dark:bg-category-health/20',
    label: 'Salud',
  },
  EDUCATION: {
    icon: GraduationCap,
    color: 'bg-category-education/10 text-category-education dark:bg-category-education/20',
    label: 'Educación',
  },
  PERSONAL: {
    icon: User,
    color: 'bg-category-personal/10 text-category-personal dark:bg-category-personal/20',
    label: 'Personal',
  },
  DEBT: {
    icon: CreditCard,
    color: 'bg-category-debt/10 text-category-debt dark:bg-category-debt/20',
    label: 'Deudas',
  },
  SAVINGS: {
    icon: PiggyBank,
    color: 'bg-category-savings/10 text-category-savings dark:bg-category-savings/20',
    label: 'Ahorro',
  },
  OTHER: {
    icon: MoreHorizontal,
    color: 'bg-category-other/10 text-category-other dark:bg-category-other/20',
    label: 'Otros',
  },
} as const;

export type CategoryKey = keyof typeof CATEGORY_CONFIG;

interface CategoryIconProps {
  category: CategoryKey;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

const sizeClasses = {
  sm: {
    container: 'h-8 w-8',
    icon: 'h-4 w-4',
  },
  md: {
    container: 'h-10 w-10 pointer-coarse:h-12 pointer-coarse:w-12',
    icon: 'h-5 w-5',
  },
  lg: {
    container: 'h-12 w-12 pointer-coarse:h-14 pointer-coarse:w-14',
    icon: 'h-6 w-6',
  },
};

/**
 * CategoryIcon Component
 * Displays transaction category with icon and optional label
 */
export function CategoryIcon({
  category,
  size = 'md',
  className,
  showLabel = false,
}: CategoryIconProps) {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.OTHER;
  const Icon = config.icon;
  const sizes = sizeClasses[size];

  if (showLabel) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div
          className={cn(
            'flex items-center justify-center rounded-full',
            sizes.container,
            config.color,
          )}
        >
          <Icon className={sizes.icon} />
        </div>
        <span className="text-foreground text-sm font-medium">{config.label}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full',
        sizes.container,
        config.color,
        className,
      )}
      title={config.label}
    >
      <Icon className={sizes.icon} />
    </div>
  );
}

/**
 * Get category label by key
 */
export function getCategoryLabel(category: CategoryKey): string {
  return CATEGORY_CONFIG[category]?.label || CATEGORY_CONFIG.OTHER.label;
}

/**
 * Get all categories
 */
export function getAllCategories(): Array<{ key: CategoryKey; label: string; icon: LucideIcon }> {
  return Object.entries(CATEGORY_CONFIG).map(([key, config]) => ({
    key: key as CategoryKey,
    label: config.label,
    icon: config.icon,
  }));
}
