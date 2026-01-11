/**
 * StatCard Component
 * Displays a statistic with label, value, and optional change
 *
 * @example
 * import { StatCard } from '@/shared/components/rumbo';
 * <StatCard
 *   label="Gastos este mes"
 *   value={450000}
 *   change={-15}
 *   format="currency"
 * />
 */

import { memo } from 'react';
import { Card } from '@/shared/components/ui/card';
import { ArrowUp, ArrowDown, type LucideIcon } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage, cn } from '@/shared/lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  format?: 'currency' | 'number' | 'percentage';
  change?: number;
  icon?: LucideIcon;
  className?: string;
}

/**
 * StatCard Component
 * Compact stat display with optional trend
 */
function StatCardComponent({
  label,
  value,
  format = 'currency',
  change,
  icon: Icon,
  className,
}: StatCardProps) {
  const formattedValue = (() => {
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value, 1);
      case 'number':
      default:
        return formatNumber(value);
    }
  })();

  const hasChange = change !== undefined && change !== 0;
  const isPositiveChange = change ? change > 0 : false;

  return (
    <Card className={cn('p-4 sm:p-6', className)}>
      <div className="space-y-2">
        {/* Icon + Label */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm font-medium">{label}</p>
          {Icon && <Icon className="text-muted-foreground h-4 w-4" />}
        </div>

        {/* Value */}
        <p className="text-2xl font-bold tabular-nums sm:text-3xl">{formattedValue}</p>

        {/* Change (optional) */}
        {hasChange && (
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-medium',
              isPositiveChange ? 'text-financial-positive' : 'text-financial-negative',
            )}
          >
            {isPositiveChange ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            <span>{Math.abs(change!)}% vs. mes anterior</span>
          </div>
        )}
      </div>
    </Card>
  );
}

// Memoize to prevent unnecessary re-renders when used in dashboard grids
export const StatCard = memo(StatCardComponent);
