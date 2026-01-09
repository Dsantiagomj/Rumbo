/**
 * BalanceDisplay Component
 * Shows total balance with metadata
 *
 * @example
 * import { BalanceDisplay } from '@/shared/components/rumbo';
 * <BalanceDisplay
 *   total={1234567.89}
 *   accounts={3}
 *   lastUpdated={new Date()}
 * />
 */

import { Card } from '@/shared/components/ui/card';
import { formatCurrency, formatRelativeTime, cn } from '@/shared/lib/utils';

interface BalanceDisplayProps {
  total: number;
  accounts?: number;
  lastUpdated?: Date | string;
  variant?: 'default' | 'gradient';
  className?: string;
}

/**
 * BalanceDisplay Component
 * Prominent display of total balance
 */
export function BalanceDisplay({
  total,
  accounts,
  lastUpdated,
  variant = 'gradient',
  className,
}: BalanceDisplayProps) {
  const isPositive = total >= 0;
  const updatedDate = lastUpdated
    ? typeof lastUpdated === 'string'
      ? new Date(lastUpdated)
      : lastUpdated
    : null;

  return (
    <Card
      className={cn(
        'p-6',
        variant === 'gradient' &&
          'from-brand-primary-500 to-brand-primary-600 border-none bg-gradient-to-br text-white',
        className,
      )}
    >
      <div className="space-y-2">
        {/* Label */}
        <p
          className={cn(
            'text-sm font-medium',
            variant === 'gradient' ? 'opacity-90' : 'text-muted-foreground',
          )}
        >
          Balance Total
        </p>

        {/* Amount */}
        <p
          className={cn(
            'text-4xl font-bold tabular-nums sm:text-5xl',
            variant === 'default' &&
              (isPositive ? 'text-financial-positive' : 'text-financial-negative'),
          )}
        >
          {formatCurrency(total)}
        </p>

        {/* Metadata */}
        <div
          className={cn(
            'flex items-center gap-2 text-sm',
            variant === 'gradient' ? 'opacity-75' : 'text-muted-foreground',
          )}
        >
          {accounts !== undefined && (
            <>
              <span>
                {accounts} {accounts === 1 ? 'cuenta' : 'cuentas'}
              </span>
              {updatedDate && <span>•</span>}
            </>
          )}
          {updatedDate && <span>Actualizado {formatRelativeTime(updatedDate)}</span>}
        </div>
      </div>
    </Card>
  );
}
