'use client';

/**
 * AccountSelector Component
 * Allows user to choose between creating a new account or appending to an existing one
 */
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { trpc } from '@/shared/lib/trpc/client';

interface AccountSelectorProps {
  /**
   * Detected bank name from imported file
   */
  bankName: string;

  /**
   * Callback when user selects an option
   * @param accountId - "new" for new account, or existing account ID
   */
  onSelect: (accountId: string) => void;

  /**
   * Currently selected value
   */
  value?: string;
}

export function AccountSelector({ bankName, onSelect, value = 'new' }: AccountSelectorProps) {
  const { data: accounts, isLoading } = trpc.accounts.getAll.useQuery();

  // Filter accounts matching the detected bank
  const compatibleAccounts = accounts?.filter((acc) => acc.bankName === bankName) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>¿Dónde deseas importar las transacciones?</CardTitle>
        <CardDescription>
          Puedes crear una cuenta nueva o agregar las transacciones a una cuenta existente
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Cargando cuentas...</p>
        ) : (
          <RadioGroup value={value} onValueChange={onSelect}>
            {/* Option 1: Create new account */}
            <div className="hover:bg-accent flex items-center space-x-2 rounded-lg border p-4 transition-colors">
              <RadioGroupItem value="new" id="new-account" />
              <Label htmlFor="new-account" className="flex-1 cursor-pointer">
                <div className="font-semibold">Crear cuenta nueva</div>
                <p className="text-muted-foreground text-sm">
                  Configurar una nueva cuenta de {bankName}
                </p>
              </Label>
            </div>

            {/* Option 2: Add to existing account */}
            {compatibleAccounts.length > 0 ? (
              <>
                <div className="text-muted-foreground text-sm font-medium">
                  O agregar a una cuenta existente:
                </div>

                {compatibleAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="hover:bg-accent flex items-center space-x-2 rounded-lg border p-4 transition-colors"
                  >
                    <RadioGroupItem value={account.id} id={`account-${account.id}`} />
                    <Label htmlFor={`account-${account.id}`} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{account.name}</div>
                          <p className="text-muted-foreground text-sm">
                            {account.accountType === 'SAVINGS' && 'Ahorros'}
                            {account.accountType === 'CHECKING' && 'Corriente'}
                            {account.accountType === 'CREDIT_CARD' && 'Tarjeta de Crédito'}
                            {account.accountNumber && ` • ${account.accountNumber}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            ${account.currentBalance.toLocaleString('es-CO')}
                          </div>
                          <p className="text-muted-foreground text-xs">
                            {account._count.transactions} transacciones
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </>
            ) : (
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  No tienes cuentas de {bankName}. Se creará una cuenta nueva.
                </AlertDescription>
              </Alert>
            )}
          </RadioGroup>
        )}

        {compatibleAccounts.length > 0 && (
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Tip:</strong> Si agregas a una cuenta existente, detectaremos automáticamente
              las transacciones duplicadas para evitar importaciones repetidas.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
