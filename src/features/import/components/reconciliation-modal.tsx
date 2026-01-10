'use client';

/**
 * ReconciliationModal Component
 * Handles balance mismatch reconciliation with 3 options:
 * 1. OVERRIDE - Use calculated balance
 * 2. AI_FIND - Let AI suggest missing transactions
 * 3. MANUAL - Add missing transactions manually
 */
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Label } from '@/shared/components/ui/label';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  AlertTriangle,
  Sparkles,
  Loader2,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { trpc } from '@/shared/lib/trpc/client';
import type { SuggestedTransaction } from '@/features/import/utils/ai-reconciliation';

interface ReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedBalance: number;
  calculatedBalance: number;
  importId: string;
  transactions: Array<{
    date: Date;
    description: string;
    amount: number;
    type: 'EXPENSE' | 'INCOME';
  }>;
  onConfirm: (
    method: 'OVERRIDE' | 'AI_FIND' | 'MANUAL',
    suggestedTransactions?: Array<{
      date: Date;
      description: string;
      amount: number;
      type: 'EXPENSE' | 'INCOME';
    }>,
  ) => void;
}

export function ReconciliationModal({
  isOpen,
  onClose,
  reportedBalance,
  calculatedBalance,
  importId,
  transactions,
  onConfirm,
}: ReconciliationModalProps) {
  const [method, setMethod] = useState<'OVERRIDE' | 'AI_FIND' | 'MANUAL'>('OVERRIDE');
  const [suggestions, setSuggestions] = useState<SuggestedTransaction[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());

  const suggestMutation = trpc.import.suggestMissingTransactions.useMutation();

  const difference = reportedBalance - calculatedBalance;
  const differenceAbs = Math.abs(difference);

  const handleAIFind = async () => {
    try {
      const result = await suggestMutation.mutateAsync({
        importId,
        reportedBalance,
        calculatedBalance,
        transactions: transactions.map((tx) => ({
          description: tx.description,
          amount: tx.amount,
          type: tx.type,
          date: tx.date,
        })),
      });

      setSuggestions(result.suggestions);

      // Auto-select high confidence suggestions (>0.7)
      const highConfidence = new Set(
        result.suggestions
          .map((s, index) => (s.confidence > 0.7 ? index : -1))
          .filter((i) => i >= 0),
      );
      setSelectedSuggestions(highConfidence);
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
    }
  };

  const handleToggleSuggestion = (index: number) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSuggestions(newSelected);
  };

  const handleConfirm = () => {
    if (method === 'AI_FIND' && selectedSuggestions.size > 0) {
      const selectedTransactions = Array.from(selectedSuggestions).map((index) => {
        const suggestion = suggestions[index];
        return {
          date: new Date(suggestion.date),
          description: suggestion.description,
          amount: suggestion.amount,
          type: suggestion.type,
        };
      });
      onConfirm(method, selectedTransactions);
    } else {
      onConfirm(method);
    }
  };

  const selectedTotal = Array.from(selectedSuggestions).reduce((sum, index) => {
    return sum + suggestions[index].amount;
  }, 0);

  const remainingDifference = difference - selectedTotal;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Balance no coincide
          </DialogTitle>
          <DialogDescription>
            El balance reportado por el banco difiere del balance calculado. ¿Cómo deseas proceder?
          </DialogDescription>
        </DialogHeader>

        {/* Balance Summary */}
        <Alert variant="default" className="border-orange-200 bg-orange-50 dark:bg-orange-950">
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Balance reportado:</span>
                <span className="font-semibold">
                  ${reportedBalance.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Balance calculado:</span>
                <span className="font-semibold">
                  ${calculatedBalance.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Diferencia:</span>
                <span className={`font-bold ${difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {difference > 0 ? '+' : ''}$
                  {differenceAbs.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Method Selection */}
        <RadioGroup value={method} onValueChange={(v) => setMethod(v as typeof method)}>
          {/* Option 1: Override */}
          <div className="hover:bg-accent flex items-start space-x-3 rounded-lg border p-4 transition-colors">
            <RadioGroupItem value="OVERRIDE" id="override" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="override" className="cursor-pointer">
                <div className="font-semibold">Usar balance calculado</div>
                <p className="text-muted-foreground text-sm">
                  Ignorar la discrepancia y continuar con el balance calculado de las transacciones
                </p>
              </Label>
            </div>
          </div>

          {/* Option 2: AI Find */}
          <div className="hover:bg-accent flex items-start space-x-3 rounded-lg border p-4 transition-colors">
            <RadioGroupItem value="AI_FIND" id="ai-find" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="ai-find" className="cursor-pointer">
                <div className="flex items-center gap-2 font-semibold">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  Buscar con inteligencia artificial
                </div>
                <p className="text-muted-foreground text-sm">
                  Dejar que la IA sugiera transacciones faltantes basándose en patrones y cargos
                  bancarios típicos
                </p>
              </Label>
            </div>
          </div>

          {/* Option 3: Manual */}
          <div className="hover:bg-accent flex items-start space-x-3 rounded-lg border p-4 transition-colors">
            <RadioGroupItem value="MANUAL" id="manual" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="manual" className="cursor-pointer">
                <div className="font-semibold">Agregar manualmente</div>
                <p className="text-muted-foreground text-sm">
                  Revisar y agregar las transacciones faltantes manualmente después de confirmar
                </p>
              </Label>
            </div>
          </div>
        </RadioGroup>

        {/* AI Suggestions */}
        {method === 'AI_FIND' && (
          <div className="space-y-4">
            {suggestions.length === 0 ? (
              <Button
                onClick={handleAIFind}
                disabled={suggestMutation.isPending}
                className="w-full"
              >
                {suggestMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analizando transacciones...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Buscar transacciones faltantes
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Transacciones sugeridas ({suggestions.length})</h4>
                  {selectedSuggestions.size > 0 && (
                    <Badge variant="secondary">{selectedSuggestions.size} seleccionadas</Badge>
                  )}
                </div>

                {suggestions.length === 0 && !suggestMutation.isPending && (
                  <Alert>
                    <AlertDescription>
                      La IA no pudo sugerir transacciones con suficiente confianza. Intenta agregar
                      las transacciones manualmente.
                    </AlertDescription>
                  </Alert>
                )}

                {suggestions.map((suggestion, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer p-4 transition-all ${
                      selectedSuggestions.has(index)
                        ? 'border-brand-primary-500 bg-brand-primary-500/5'
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => handleToggleSuggestion(index)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedSuggestions.has(index)}
                        onCheckedChange={() => handleToggleSuggestion(index)}
                        className="mt-1"
                      />

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold">{suggestion.description}</div>
                            <p className="text-muted-foreground text-xs">{suggestion.date}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {suggestion.type === 'INCOME' ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span
                              className={`font-bold ${
                                suggestion.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {suggestion.amount > 0 ? '+' : ''}$
                              {Math.abs(suggestion.amount).toLocaleString('es-CO')}
                            </span>
                          </div>
                        </div>

                        <p className="text-muted-foreground text-sm">{suggestion.reasoning}</p>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={
                              suggestion.confidence > 0.7
                                ? 'bg-green-100 text-green-700'
                                : suggestion.confidence > 0.5
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-orange-100 text-orange-700'
                            }
                          >
                            {(suggestion.confidence * 100).toFixed(0)}% confianza
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                {selectedSuggestions.size > 0 && (
                  <Alert>
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total sugerido:</span>
                          <span className="font-semibold">
                            {selectedTotal > 0 ? '+' : ''}$
                            {Math.abs(selectedTotal).toLocaleString('es-CO')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Diferencia restante:</span>
                          <span
                            className={`font-semibold ${
                              Math.abs(remainingDifference) < 1000
                                ? 'text-green-600'
                                : 'text-orange-600'
                            }`}
                          >
                            ${Math.abs(remainingDifference).toLocaleString('es-CO')}
                          </span>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              (method === 'AI_FIND' && selectedSuggestions.size === 0) || suggestMutation.isPending
            }
            className="flex-1"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
