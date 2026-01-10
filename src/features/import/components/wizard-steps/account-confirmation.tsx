'use client';

/**
 * Account Confirmation Step (Step 1)
 * User confirms account details and current balance
 */
import { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Wallet, TrendingUp, CreditCard, AlertTriangle } from 'lucide-react';
import type { ParsedImportData, WizardData } from '../import-wizard';

interface AccountConfirmationStepProps {
  importData: ParsedImportData;
  wizardData: WizardData;
  onDataUpdate: (updates: Partial<WizardData>) => void;
  onNext: () => void;
  onBack?: () => void;
}

const ACCOUNT_TYPE_ICONS = {
  SAVINGS: Wallet,
  CHECKING: TrendingUp,
  CREDIT_CARD: CreditCard,
};

const ACCOUNT_TYPE_LABELS = {
  SAVINGS: 'Ahorros',
  CHECKING: 'Corriente',
  CREDIT_CARD: 'Tarjeta de Crédito',
};

export function AccountConfirmationStep({
  importData,
  wizardData,
  onDataUpdate,
  onNext,
  onBack,
}: AccountConfirmationStepProps) {
  const [accountName, setAccountName] = useState(wizardData.accountName);
  const [accountType, setAccountType] = useState(wizardData.accountType);
  const [initialBalance, setInitialBalance] = useState(wizardData.initialBalance);

  const handleContinue = () => {
    // Update wizard data
    onDataUpdate({
      accountName,
      accountType,
      initialBalance,
    });
    onNext();
  };

  const Icon = ACCOUNT_TYPE_ICONS[importData.account.accountType];

  return (
    <div className="space-y-6">
      {/* Detection Summary */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Cuenta Detectada</h3>
            <p className="text-muted-foreground text-sm">
              Detectamos automáticamente los detalles de tu cuenta bancaria
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-muted-foreground text-xs">Banco</p>
                <p className="font-medium">{importData.account.bankName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Tipo</p>
                <p className="font-medium">{ACCOUNT_TYPE_LABELS[importData.account.accountType]}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Transacciones</p>
                <p className="font-medium">{importData.transactions.length}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Account Details */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Detalles de la Cuenta</h3>
        <div className="space-y-4">
          {/* Account Name */}
          <div className="space-y-2">
            <Label htmlFor="account-name">Nombre de la cuenta</Label>
            <Input
              id="account-name"
              placeholder="Ej: Ahorros Bancolombia"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
            <p className="text-muted-foreground text-xs">
              Un nombre descriptivo para identificar esta cuenta
            </p>
          </div>

          {/* Account Type */}
          <div className="space-y-2">
            <Label htmlFor="account-type">Tipo de cuenta</Label>
            <Select
              value={accountType}
              onValueChange={(value) =>
                setAccountType(value as 'SAVINGS' | 'CHECKING' | 'CREDIT_CARD')
              }
            >
              <SelectTrigger id="account-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SAVINGS">Ahorros</SelectItem>
                <SelectItem value="CHECKING">Corriente</SelectItem>
                <SelectItem value="CREDIT_CARD">Tarjeta de Crédito</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Initial Balance */}
          <div className="space-y-2">
            <Label htmlFor="initial-balance">Balance Actual</Label>
            <div className="relative">
              <span className="text-muted-foreground absolute top-2.5 left-3">$</span>
              <Input
                id="initial-balance"
                type="number"
                className="pl-7"
                value={initialBalance}
                onChange={(e) => setInitialBalance(parseFloat(e.target.value) || 0)}
              />
            </div>
            {importData.account.reportedBalance !== null && (
              <p className="text-muted-foreground text-xs">
                Balance reportado en el extracto: $
                {importData.account.reportedBalance.toLocaleString('es-CO', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            )}
          </div>

          {/* Account Number (Optional) */}
          {importData.account.accountNumber && (
            <div className="space-y-2">
              <Label htmlFor="account-number">Número de cuenta</Label>
              <Input
                id="account-number"
                value={importData.account.accountNumber}
                disabled
                className="bg-muted"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Confidence Warning */}
      {importData.confidence < 0.8 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            La detección automática tiene una confianza del{' '}
            {(importData.confidence * 100).toFixed(0)}%. Por favor verifica que los datos sean
            correctos antes de continuar.
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex justify-between gap-3">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Atrás
          </Button>
        )}
        <Button
          onClick={handleContinue}
          size="lg"
          disabled={!accountName.trim()}
          className="ml-auto"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
