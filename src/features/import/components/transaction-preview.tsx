'use client';

/**
 * TransactionPreview Component
 * Compact card display for a single transaction
 */
import { useState, memo } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Tag, Sparkles, Plus } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { trpc } from '@/shared/lib/trpc/client';
import { cn } from '@/shared/lib/utils';

interface Category {
  id: string;
  name: string;
  key: string;
  type: 'EXPENSE' | 'INCOME';
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

function TransactionPreviewComponent({
  transaction,
  categoryId,
  categoryName,
  confidence,
  categories,
  onCategoryChange,
  editable = false,
}: TransactionPreviewProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const utils = trpc.useUtils();
  const createCategory = trpc.categories.create.useMutation({
    onSuccess: async (newCategory) => {
      // Refresh categories list
      await utils.categories.getAll.invalidate();
      // Auto-select the newly created category
      if (onCategoryChange) {
        onCategoryChange(newCategory.id);
      }
      // Close dialog and reset form
      setShowCreateDialog(false);
      setNewCategoryName('');
      setIsCreating(false);
    },
    onError: (error) => {
      setIsCreating(false);
      alert(error.message);
    },
  });

  const isIncome = transaction.type === 'INCOME';
  const formattedDate = new Date(transaction.date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Filter categories by transaction type
  const filteredCategories = categories?.filter((cat) => cat.type === transaction.type);

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      alert('Por favor ingresa un nombre para la categoría');
      return;
    }

    setIsCreating(true);
    createCategory.mutate({
      name: newCategoryName.trim(),
      type: transaction.type,
    });
  };

  return (
    <Card className="hover:bg-muted/50 p-4 transition-colors">
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            isIncome ? 'bg-green-100' : 'bg-red-100',
          )}
          aria-hidden="true"
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
                <SelectTrigger
                  className="h-8 text-sm"
                  aria-label="Seleccionar categoría para la transacción"
                >
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                  <div className="border-t p-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowCreateDialog(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Nueva Categoría
                    </Button>
                  </div>
                </SelectContent>
              </Select>

              {confidence !== undefined && confidence > 0 && (
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-purple-500" aria-hidden="true" />
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
                    aria-label={`Confianza de categorización AI: ${(confidence * 100).toFixed(0)} por ciento`}
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

      {/* Create Category Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Categoría</DialogTitle>
            <DialogDescription>
              Crea una categoría personalizada para{' '}
              {transaction.type === 'INCOME' ? 'ingresos' : 'gastos'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nombre de la categoría</Label>
              <Input
                id="category-name"
                placeholder="Ej: Suscripciones, Mascotas, etc."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateCategory();
                  }
                }}
              />
            </div>

            <div className="text-muted-foreground text-sm">
              <p>
                Tipo: <strong>{transaction.type === 'INCOME' ? 'Ingreso' : 'Gasto'}</strong>
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setNewCategoryName('');
              }}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateCategory} disabled={isCreating || !newCategoryName.trim()}>
              {isCreating ? 'Creando...' : 'Crear Categoría'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Memoized export to prevent unnecessary re-renders
export const TransactionPreview = memo(TransactionPreviewComponent);
