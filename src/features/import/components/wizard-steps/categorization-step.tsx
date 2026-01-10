'use client';

/**
 * Categorization Step (Step 3)
 * Shows transactions WITHOUT clear categories
 * User can assign categories or mark as "Otros Gastos/Ingresos"
 * Content is blocked until AI categorization completes
 */
import { useMemo, useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Loader2, Sparkles, Tag, AlertCircle, CheckCircle2 } from 'lucide-react';
import { TransactionPreview } from '../transaction-preview';
import { trpc } from '@/shared/lib/trpc/client';
import type { ParsedImportData, WizardData } from '../import-wizard';

interface CategorizationStepProps {
  importData: ParsedImportData;
  wizardData: WizardData;
  onDataUpdate: (updates: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Minimum confidence threshold for "clear" categorization
const CONFIDENCE_THRESHOLD = 0.7;

export function CategorizationStep({
  importData,
  wizardData,
  onDataUpdate,
  onNext,
  onBack,
}: CategorizationStepProps) {
  const { data: categories } = trpc.categories.getAll.useQuery();

  // Get transactions that don't have clear categories OR have no category at all
  const unclearTransactions = useMemo(() => {
    return importData.transactions
      .map((transaction, index) => {
        const categoryId = wizardData.transactionCategories.get(index);
        const confidence = wizardData.categoryConfidences.get(index) || 0;

        // Transaction is unclear if:
        // 1. No category assigned at all, OR
        // 2. Has category but low confidence
        const isUnclear = !categoryId || confidence < CONFIDENCE_THRESHOLD;

        return {
          transaction,
          index,
          categoryId,
          confidence,
          isUnclear,
        };
      })
      .filter((item) => item.isUnclear);
  }, [importData.transactions, wizardData.transactionCategories, wizardData.categoryConfidences]);

  // Auto-assign "Otros" to transactions without any category
  useEffect(() => {
    const otherExpenseCategory = categories?.find(
      (c) => c.key === 'OTHER_EXPENSES' && c.type === 'EXPENSE',
    );
    const otherIncomeCategory = categories?.find(
      (c) => c.key === 'OTHER_INCOME' && c.type === 'INCOME',
    );

    const newCategories = new Map(localCategories);
    let hasChanges = false;

    unclearTransactions.forEach(({ transaction, index, categoryId }) => {
      // Only auto-assign if no category exists AND not already set locally
      if (!categoryId && !localCategories.has(index)) {
        const defaultCategoryId =
          transaction.type === 'EXPENSE' ? otherExpenseCategory?.id : otherIncomeCategory?.id;
        if (defaultCategoryId) {
          newCategories.set(index, defaultCategoryId);
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setLocalCategories(newCategories);
    }
  }, [unclearTransactions, categories]);

  const [localCategories, setLocalCategories] = useState<Map<number, string>>(new Map());

  const handleCategoryChange = (index: number, categoryId: string) => {
    setLocalCategories((prev) => {
      const next = new Map(prev);
      next.set(index, categoryId);
      return next;
    });
  };

  const handleMarkAllAsOther = () => {
    const otherExpenseCategory = categories?.find(
      (c) => c.key === 'OTHER_EXPENSES' && c.type === 'EXPENSE',
    );
    const otherIncomeCategory = categories?.find(
      (c) => c.key === 'OTHER_INCOME' && c.type === 'INCOME',
    );

    const newCategories = new Map(localCategories);
    unclearTransactions.forEach(({ transaction, index }) => {
      if (!localCategories.has(index)) {
        const categoryId =
          transaction.type === 'EXPENSE' ? otherExpenseCategory?.id : otherIncomeCategory?.id;
        if (categoryId) {
          newCategories.set(index, categoryId);
        }
      }
    });

    setLocalCategories(newCategories);
  };

  const handleContinue = () => {
    // Merge local categories with wizard data
    const updatedCategories = new Map(wizardData.transactionCategories);
    localCategories.forEach((categoryId, index) => {
      updatedCategories.set(index, categoryId);
    });

    onDataUpdate({
      transactionCategories: updatedCategories,
    });

    onNext();
  };

  // Calculate progress
  const categorizedCount = unclearTransactions.filter(
    ({ index }) => localCategories.has(index) || wizardData.transactionCategories.has(index),
  ).length;
  const progress =
    unclearTransactions.length > 0 ? (categorizedCount / unclearTransactions.length) * 100 : 100;

  // If still categorizing with AI, show loading state
  if (wizardData.isCategorizing) {
    return (
      <div className="space-y-6">
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-purple-500" />
            <h3 className="mb-2 text-lg font-semibold">Categorizando con IA...</h3>
            <p className="text-muted-foreground mb-4 max-w-md text-sm">
              Estamos analizando tus transacciones para sugerir categorías. Esto tomará unos
              segundos.
            </p>
            <div className="w-full max-w-sm">
              <div className="mb-2 flex justify-between text-sm">
                <span>Progreso</span>
                <span>{wizardData.categorizationProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${wizardData.categorizationProgress}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // If no unclear transactions, show success
  if (unclearTransactions.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">¡Todas las transacciones categorizadas!</h3>
            <p className="text-muted-foreground mb-6 max-w-md text-sm">
              La IA categorizó exitosamente todas tus transacciones con alta confianza.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onBack}>
                Atrás
              </Button>
              <Button onClick={handleContinue}>Continuar</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="mb-2 text-lg font-semibold">Categorizar Transacciones</h3>
            <p className="text-muted-foreground text-sm">
              Encontramos {unclearTransactions.length} transacciones que necesitan categorización
              manual o tienen baja confianza.
            </p>
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            <Sparkles className="mr-1 h-3 w-3" />
            AI
          </Badge>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="mb-2 flex justify-between text-sm">
            <span>Progreso</span>
            <span>
              {categorizedCount} / {unclearTransactions.length}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Quick Action */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-sm">
            ¿No quieres categorizar manualmente? Puedes marcar todas como "Otros"
          </span>
          <Button variant="outline" size="sm" onClick={handleMarkAllAsOther}>
            Marcar todas como "Otros"
          </Button>
        </AlertDescription>
      </Alert>

      {/* Transaction List */}
      <div className="space-y-3">
        {unclearTransactions.map(({ transaction, index, categoryId, confidence }) => {
          const finalCategoryId = localCategories.get(index) || categoryId;
          const categoryName = categories?.find((c) => c.id === finalCategoryId)?.name;

          return (
            <Card key={index} className="p-4">
              <TransactionPreview
                transaction={transaction}
                categoryId={finalCategoryId}
                categoryName={categoryName}
                confidence={confidence}
                categories={categories
                  ?.filter((c) => c.type === transaction.type)
                  .map((c) => ({
                    id: c.id,
                    name: c.name,
                    key: c.key,
                    type: c.type as 'EXPENSE' | 'INCOME',
                  }))}
                onCategoryChange={(newCategoryId) => handleCategoryChange(index, newCategoryId)}
                editable
              />

              {/* Confidence Badge */}
              {confidence > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <Tag className="h-3 w-3 text-gray-400" />
                  <span className="text-muted-foreground text-xs">
                    Sugerencia AI: {(confidence * 100).toFixed(0)}% confianza
                  </span>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-between gap-3">
        <Button variant="outline" onClick={onBack}>
          Atrás
        </Button>
        <Button onClick={handleContinue} disabled={categorizedCount < unclearTransactions.length}>
          Continuar
          {categorizedCount < unclearTransactions.length &&
            ` (${unclearTransactions.length - categorizedCount} pendientes)`}
        </Button>
      </div>
    </div>
  );
}
