'use client';

/**
 * Suggested Accounts Step (Step 2)
 * Shows intelligent suggestions for additional accounts to configure
 * Based on transaction patterns (credit card payments, cash withdrawals, etc.)
 */
import { useEffect, useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { CreditCard, Wallet, TrendingUp, PiggyBank, ChevronRight, Info } from 'lucide-react';
import { detectAdditionalAccounts, getAccountTypeLabel } from '../../utils/account-detection';
import { CreateSuggestedAccountDialog } from './create-suggested-account-dialog';
import type { ParsedImportData } from '../import-wizard';
import type { AccountSuggestion, SuggestedAccountType } from '../../utils/account-detection';

interface SuggestedAccountsStepProps {
  importData: ParsedImportData;
  onNext: () => void;
  onBack: () => void;
}

const ACCOUNT_TYPE_ICONS = {
  CREDIT_CARD: CreditCard,
  CASH: Wallet,
  INVESTMENT: TrendingUp,
  SAVINGS_ACCOUNT: PiggyBank,
};

const CONFIDENCE_COLORS = {
  high: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-orange-100 text-orange-700 border-orange-200',
};

function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence > 0.8) return 'high';
  if (confidence > 0.6) return 'medium';
  return 'low';
}

export function SuggestedAccountsStep({ importData, onNext, onBack }: SuggestedAccountsStepProps) {
  const [suggestions, setSuggestions] = useState<AccountSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<SuggestedAccountType>>(
    new Set(),
  );
  const [currentDialogType, setCurrentDialogType] = useState<SuggestedAccountType | null>(null);
  const [accountsToCreate, setAccountsToCreate] = useState<SuggestedAccountType[]>([]);
  const [createdCount, setCreatedCount] = useState(0);

  useEffect(() => {
    // Analyze transactions to detect additional accounts
    const detectedSuggestions = detectAdditionalAccounts(importData.transactions);
    setSuggestions(detectedSuggestions);

    // Auto-select high confidence suggestions
    const highConfidenceSuggestions = new Set(
      detectedSuggestions.filter((s) => s.confidence > 0.8).map((s) => s.type),
    );
    setSelectedSuggestions(highConfidenceSuggestions);
  }, [importData]);

  const toggleSuggestion = (type: SuggestedAccountType) => {
    setSelectedSuggestions((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const handleContinue = () => {
    // Convert selected suggestions to array
    const toCreate = Array.from(selectedSuggestions);

    if (toCreate.length === 0) {
      // No accounts selected, just continue
      onNext();
      return;
    }

    // Start creating accounts one by one
    setAccountsToCreate(toCreate);
    setCurrentDialogType(toCreate[0]);
    setCreatedCount(0);
  };

  const handleAccountCreated = () => {
    const newCreatedCount = createdCount + 1;
    setCreatedCount(newCreatedCount);

    // Check if there are more accounts to create
    if (newCreatedCount < accountsToCreate.length) {
      setCurrentDialogType(accountsToCreate[newCreatedCount]);
    } else {
      // All accounts created, continue to next step
      setCurrentDialogType(null);
      onNext();
    }
  };

  const handleSkip = () => {
    onNext();
  };

  if (suggestions.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Info className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No se detectaron cuentas adicionales</h3>
            <p className="text-muted-foreground mb-6 max-w-md text-sm">
              No encontramos patrones que sugieran la necesidad de configurar cuentas adicionales
              como tarjetas de crédito o efectivo.
            </p>
            <Button onClick={handleContinue}>Continuar</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <h3 className="mb-2 text-lg font-semibold">Cuentas Sugeridas</h3>
        <p className="text-muted-foreground text-sm">
          Detectamos patrones en tus transacciones que sugieren que podrías beneficiarte de
          configurar estas cuentas adicionales. Puedes configurarlas ahora o más tarde.
        </p>
      </Card>

      {/* Suggestions List */}
      <div className="space-y-3">
        {suggestions.map((suggestion) => {
          const Icon = ACCOUNT_TYPE_ICONS[suggestion.type];
          const confidenceLevel = getConfidenceLevel(suggestion.confidence);
          const isSelected = selectedSuggestions.has(suggestion.type);

          return (
            <Card
              key={suggestion.type}
              className={`cursor-pointer transition-all ${
                isSelected ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
              }`}
              onClick={() => toggleSuggestion(suggestion.type)}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                      isSelected ? 'bg-blue-500' : 'bg-gray-100'
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h4 className="font-semibold">{getAccountTypeLabel(suggestion.type)}</h4>
                      <Badge variant="secondary" className={CONFIDENCE_COLORS[confidenceLevel]}>
                        {(suggestion.confidence * 100).toFixed(0)}% confianza
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3 text-sm">{suggestion.reason}</p>

                    {/* Transaction Examples */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-700">
                        Transacciones detectadas ({suggestion.transactions.length}):
                      </p>
                      <div className="space-y-1">
                        {suggestion.transactions.slice(0, 3).map((tx, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded bg-white px-3 py-2 text-xs"
                          >
                            <span className="text-muted-foreground truncate">{tx.description}</span>
                            <span className="ml-2 shrink-0 font-medium">
                              ${Math.abs(tx.amount).toLocaleString('es-CO')}
                            </span>
                          </div>
                        ))}
                        {suggestion.transactions.length > 3 && (
                          <p className="text-muted-foreground px-3 text-xs">
                            +{suggestion.transactions.length - 3} más
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                      isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}
                  >
                    {isSelected && <ChevronRight className="h-4 w-4 text-white" />}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Configurar estas cuentas te ayudará a rastrear mejor tus finanzas. Puedes agregarlas más
          tarde desde el panel de cuentas.
        </AlertDescription>
      </Alert>

      {/* Actions */}
      <div className="flex justify-between gap-3">
        <Button variant="outline" onClick={onBack}>
          Atrás
        </Button>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleSkip}>
            Omitir
          </Button>
          <Button onClick={handleContinue} disabled={selectedSuggestions.size === 0}>
            Continuar ({selectedSuggestions.size} seleccionadas)
          </Button>
        </div>
      </div>

      {/* Create Account Dialogs */}
      {currentDialogType && (
        <CreateSuggestedAccountDialog
          accountType={currentDialogType}
          open={!!currentDialogType}
          onOpenChange={(open) => {
            if (!open) {
              // User cancelled, continue without creating
              setCurrentDialogType(null);
              onNext();
            }
          }}
          onSuccess={handleAccountCreated}
        />
      )}
    </div>
  );
}
