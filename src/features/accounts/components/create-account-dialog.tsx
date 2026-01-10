'use client';

/**
 * Create Account Dialog
 * Manual account creation with all necessary fields
 */
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
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
import { Loader2 } from 'lucide-react';
import { trpc } from '@/shared/lib/trpc/client';

interface CreateAccountDialogProps {
  children?: React.ReactNode;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateAccountDialog({
  children,
  onSuccess,
  open: controlledOpen,
  onOpenChange,
}: CreateAccountDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled open state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [name, setName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState<'SAVINGS' | 'CHECKING' | 'CREDIT_CARD'>('SAVINGS');
  const [accountNumber, setAccountNumber] = useState('');
  const [currentBalance, setCurrentBalance] = useState(0);

  const createAccount = trpc.accounts.create.useMutation({
    onSuccess: () => {
      if (controlledOpen !== undefined) {
        setOpen(false);
      }
      resetForm();
      onSuccess?.();
    },
  });

  const resetForm = () => {
    setName('');
    setBankName('');
    setAccountType('SAVINGS');
    setAccountNumber('');
    setCurrentBalance(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !bankName.trim()) {
      return;
    }

    createAccount.mutate({
      name: name.trim(),
      bankName: bankName.trim(),
      accountType,
      accountNumber: accountNumber.trim() || undefined,
      initialBalance: currentBalance,
      currentBalance,
    });
  };

  // Render form content
  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Account Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Nombre de la cuenta *</Label>
        <Input
          id="name"
          placeholder="Ej: Ahorros Bancolombia"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {/* Bank Name */}
      <div className="space-y-2">
        <Label htmlFor="bankName">Banco *</Label>
        <Input
          id="bankName"
          placeholder="Ej: Bancolombia, Nequi, Efectivo"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          required
        />
      </div>

      {/* Account Type */}
      <div className="space-y-2">
        <Label htmlFor="accountType">Tipo de cuenta *</Label>
        <Select
          value={accountType}
          onValueChange={(value) => setAccountType(value as 'SAVINGS' | 'CHECKING' | 'CREDIT_CARD')}
        >
          <SelectTrigger id="accountType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SAVINGS">Cuenta de Ahorros</SelectItem>
            <SelectItem value="CHECKING">Cuenta Corriente</SelectItem>
            <SelectItem value="CREDIT_CARD">Tarjeta de Crédito</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Account Number (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="accountNumber">Número de cuenta (opcional)</Label>
        <Input
          id="accountNumber"
          placeholder="Últimos 4 dígitos"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
        />
      </div>

      {/* Current Balance */}
      <div className="space-y-2">
        <Label htmlFor="currentBalance">
          {accountType === 'CREDIT_CARD' ? 'Cupo disponible *' : 'Balance actual *'}
        </Label>
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
        {accountType === 'CREDIT_CARD' && (
          <p className="text-muted-foreground text-xs">
            Ingresa el cupo disponible actual de tu tarjeta
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        {controlledOpen !== undefined && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={createAccount.isPending}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          disabled={createAccount.isPending || !name.trim() || !bankName.trim()}
        >
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
  );

  // If no children (trigger), render form in a Card (standalone mode)
  if (!children) {
    return (
      <div className="bg-card rounded-lg border p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Detalles de la Cuenta</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Agrega una cuenta bancaria, tarjeta de crédito o cuenta de efectivo manualmente
          </p>
        </div>
        {formContent}
      </div>
    );
  }

  // Render as Dialog (dialog mode)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Cuenta</DialogTitle>
          <DialogDescription>
            Agrega una cuenta bancaria, tarjeta de crédito o cuenta de efectivo manualmente
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
