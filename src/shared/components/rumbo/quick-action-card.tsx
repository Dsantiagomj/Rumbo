'use client';

/**
 * QuickActionCard Component
 * Tappable card for common actions
 *
 * @example
 * import { QuickActionCard } from '@/shared/components/rumbo';
 * import { Plus } from 'lucide-react';
 * <QuickActionCard
 *   icon={Plus}
 *   label="Nueva transacción"
 *   onClick={() => console.log('clicked')}
 * />
 */

import { memo } from 'react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface QuickActionCardProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'primary';
}

/**
 * QuickActionCard Component
 * Touch-friendly action button
 */
function QuickActionCardComponent({
  icon: Icon,
  label,
  onClick,
  className,
  variant = 'default',
}: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-lg border p-4 text-center transition-colors',
        'min-h-[80px] pointer-coarse:min-h-[96px]',
        'hover:bg-accent hover:text-accent-foreground cursor-pointer',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        variant === 'primary' &&
          'border-brand-primary-500 bg-brand-primary-500/5 hover:bg-brand-primary-500/10',
        className,
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full',
          variant === 'primary' ? 'bg-brand-primary-500 text-white' : 'bg-muted',
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-xs font-medium sm:text-sm">{label}</span>
    </button>
  );
}

// Memoize to prevent unnecessary re-renders when used in lists
export const QuickActionCard = memo(QuickActionCardComponent);
