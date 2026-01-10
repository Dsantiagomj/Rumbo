'use client';

/**
 * TransactionPreview Component
 * Compact card display for a single transaction
 */
import { ArrowUpCircle, ArrowDownCircle, Tag, Sparkles } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { cn } from '@/shared/lib/utils';

interface Category {
  id: string;
  name: string;
  key: string;
}

interface TransactionPreviewProps {
  transaction: {
    date: Date;
    amount: number;
    description: string;
    type: 'EXPENSE' | 'INCOME';
  };
  categoryId?: string;
  categoryName?: string;
  confidence?: number;
  categories?: Category[];
  onCategoryChange?: (categoryId: string) => void;
  editable?: boolean;
}

export function TransactionPreview({
  transaction,
  categoryId,
  categoryName,
  confidence,
  categories,
  onCategoryChange,
  editable = false,
}: TransactionPreviewProps) {
  const isIncome = transaction.type === 'INCOME';
  const formattedDate = new Date(transaction.date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Filter categories by transaction type
  // For now, show all categories. Future: filter by transaction type
  const filteredCategories = categories;

  return (
    <Card className="hover:bg-muted/50 p-4 transition-colors">
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            isIncome ? 'bg-green-100' : 'bg-red-100',
          )}
        >
          {isIncome ? (
            <ArrowUpCircle className="h-5 w-5 text-green-600" />
          ) : (
            <ArrowDownCircle className="h-5 w-5 text-red-600" />
          )}
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{transaction.description}</p>
          <p className="text-muted-foreground text-sm">{formattedDate}</p>
        </div>

        {/* Amount */}
        <div className="shrink-0 text-right">
          <p className={cn('text-lg font-semibold', isIncome ? 'text-green-600' : 'text-red-600')}>
            {isIncome ? '+' : '-'}$
            {Math.abs(transaction.amount).toLocaleString('es-CO', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-muted-foreground text-xs">{isIncome ? 'Ingreso' : 'Gasto'}</p>
        </div>
      </div>

      {/* Category Section */}
      {(categoryId || editable) && (
        <div className="mt-3 flex items-center gap-2 border-t pt-3">
          <Tag className="text-muted-foreground h-4 w-4 shrink-0" />

          {editable && categories && onCategoryChange ? (
            <div className="flex flex-1 items-center gap-2">
              <Select value={categoryId || ''} onValueChange={onCategoryChange}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {confidence !== undefined && confidence > 0 && (
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-purple-500" />
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-xs',
                      confidence > 0.8
                        ? 'bg-green-100 text-green-700'
                        : confidence > 0.6
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-orange-100 text-orange-700',
                    )}
                  >
                    {(confidence * 100).toFixed(0)}%
                  </Badge>
                </div>
              )}
            </div>
          ) : categoryName ? (
            <div className="flex items-center gap-2">
              <span className="text-sm">{categoryName}</span>
              {confidence !== undefined && confidence > 0 && (
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs',
                    confidence > 0.8
                      ? 'bg-green-100 text-green-700'
                      : confidence > 0.6
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-orange-100 text-orange-700',
                  )}
                >
                  AI {(confidence * 100).toFixed(0)}%
                </Badge>
              )}
            </div>
          ) : null}
        </div>
      )}
    </Card>
  );
}
