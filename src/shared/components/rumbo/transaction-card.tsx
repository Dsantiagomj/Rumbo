'use client';

/**
 * TransactionCard Component
 * Displays transaction information with actions
 *
 * @example
 * import { TransactionCard } from '@/shared/components/rumbo';
 * <TransactionCard
 *   amount={-50000}
 *   description="Almuerzo"
 *   category="FOOD"
 *   date={new Date()}
 * />
 */

import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { CategoryIcon, type CategoryKey } from './category-icon';
import { formatCurrency, formatTransactionDate, cn } from '@/shared/lib/utils';

interface TransactionCardProps {
  id?: string;
  amount: number;
  description: string;
  category: CategoryKey;
  date: Date | string;
  onEdit?: (id?: string) => void;
  onDelete?: (id?: string) => void;
  className?: string;
}

/**
 * TransactionCard Component
 * Mobile-first card for displaying transactions
 */
export function TransactionCard({
  id,
  amount,
  description,
  category,
  date,
  onEdit,
  onDelete,
  className,
}: TransactionCardProps) {
  const isExpense = amount < 0;
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return (
    <Card className={cn('p-4 pointer-coarse:p-6', className)}>
      <div className="flex items-start justify-between gap-4">
        {/* Left: Icon + Description */}
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <CategoryIcon category={category} size="md" />
          <div className="min-w-0 flex-1 space-y-1">
            <p className="truncate text-sm font-medium sm:text-base">{description}</p>
            <p className="text-muted-foreground text-xs sm:text-sm">
              {formatTransactionDate(dateObj)}
            </p>
          </div>
        </div>

        {/* Right: Amount */}
        <div className="flex-shrink-0 text-right">
          <p
            className={cn(
              'text-lg font-semibold tabular-nums sm:text-xl',
              isExpense ? 'text-financial-negative' : 'text-financial-positive',
            )}
          >
            {isExpense ? '-' : '+'}
            {formatCurrency(Math.abs(amount))}
          </p>
        </div>
      </div>

      {/* Actions (optional) */}
      {(onEdit || onDelete) && (
        <div className="mt-3 flex gap-2 pointer-coarse:mt-4">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(id)}
              className="h-10 flex-1 pointer-coarse:h-12"
            >
              Editar
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(id)}
              className="h-10 pointer-coarse:h-12"
            >
              Eliminar
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
