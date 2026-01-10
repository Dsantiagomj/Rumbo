'use client';

/**
 * Create Suggested Account Dialog
 * Shows a form to create each suggested account with necessary details
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
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Loader2 } from 'lucide-react';
import { trpc } from '@/shared/lib/trpc/client';
import type { SuggestedAccountType } from '../../utils/account-detection';
import { getAccountTypeLabel } from '../../utils/account-detection';

interface CreateSuggestedAccountDialogProps {
  accountType: SuggestedAccountType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ACCOUNT_TYPE_MAPPING = {
  CREDIT_CARD: 'CREDIT_CARD' as const,
  CASH: 'SAVINGS' as const, // Cash is tracked as a savings-like account
  INVESTMENT: 'SAVINGS' as const, // Investment is savings-like
  SAVINGS_ACCOUNT: 'SAVINGS' as const,
};

export function CreateSuggestedAccountDialog({
  accountType,
  open,
  onOpenChange,
  onSuccess,
}: CreateSuggestedAccountDialogProps) {
  const [name, setName] = useState(getAccountTypeLabel(accountType));
  const [currentBalance, setCurrentBalance] = useState(0);

  const createAccount = trpc.accounts.create.useMutation({
    onSuccess: () => {
      onOpenChange(false);
      resetForm();
      onSuccess();
    },
  });

  const resetForm = () => {
    setName(getAccountTypeLabel(accountType));
    setCurrentBalance(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    const mappedAccountType = ACCOUNT_TYPE_MAPPING[accountType];

    createAccount.mutate({
      name: name.trim(),
      bankName: accountType === 'CASH' ? 'Efectivo' : 'Otro',
      accountType: mappedAccountType,
      initialBalance: currentBalance,
      currentBalance,
    });
  };

  const getBalanceLabel = () => {
    switch (accountType) {
      case 'CREDIT_CARD':
        return 'Cupo disponible';
      case 'CASH':
        return 'Efectivo actual';
      case 'INVESTMENT':
        return 'Valor de inversiones';
      case 'SAVINGS_ACCOUNT':
        return 'Balance actual';
    }
  };

  const getBalanceDescription = () => {
    switch (accountType) {
      case 'CREDIT_CARD':
        return 'Ingresa el cupo disponible actual de tu tarjeta de crédito';
      case 'CASH':
        return 'Ingresa cuánto efectivo tienes actualmente';
      case 'INVESTMENT':
        return 'Ingresa el valor total de tus inversiones';
      case 'SAVINGS_ACCOUNT':
        return 'Ingresa el balance actual de tu cuenta de ahorros';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Crear {getAccountTypeLabel(accountType)}</DialogTitle>
          <DialogDescription>Completa la información para crear esta cuenta</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la cuenta *</Label>
            <Input
              id="name"
              placeholder={`Ej: ${getAccountTypeLabel(accountType)}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Current Balance */}
          <div className="space-y-2">
            <Label htmlFor="currentBalance">{getBalanceLabel()} *</Label>
            <div className="relative">
              <span className="text-muted-foreground absolute top-2.5 left-3">$</span>
              <Input
                id="currentBalance"
                type="number"
                step="0.01"
                className="pl-7"
                value={currentBalance}
                onChange={(e) => setCurrentBalance(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <p className="text-muted-foreground text-xs">{getBalanceDescription()}</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createAccount.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createAccount.isPending || !name.trim()}>
              {createAccount.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
