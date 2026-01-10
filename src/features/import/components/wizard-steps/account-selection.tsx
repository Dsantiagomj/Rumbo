'use client';

/**
 * Account Selection Step (Step 1)
 * User selects whether to create new account or append to existing one
 */
import { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Building2, Plus, ArrowRight } from 'lucide-react';
import { trpc } from '@/shared/lib/trpc/client';
import type { ParsedImportData } from '../import-wizard';

interface AccountSelectionStepProps {
  importData: ParsedImportData;
  onSelect: (accountId: string) => void;
  onNext: () => void;
}

export function AccountSelectionStep({ importData, onSelect, onNext }: AccountSelectionStepProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('new');
  const { data: accounts } = trpc.accounts.getAll.useQuery();

  // Filter accounts by matching bank
  const compatibleAccounts = accounts?.filter(
    (acc) => acc.bankName === importData.account.bankName && acc.isActive,
  );

  const handleContinue = () => {
    onSelect(selectedAccountId);
    onNext();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="mb-2 text-lg font-semibold">¿Dónde deseas importar las transacciones?</h3>
        <p className="text-muted-foreground text-sm">
          Selecciona si deseas crear una cuenta nueva o agregar a una existente
        </p>
      </Card>

      <RadioGroup value={selectedAccountId} onValueChange={setSelectedAccountId}>
        {/* Create New Account */}
        <Card
          className={`cursor-pointer transition-all ${
            selectedAccountId === 'new' ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
          }`}
          onClick={() => setSelectedAccountId('new')}
        >
          <div className="p-6">
            <div className="flex items-center gap-4">
              <RadioGroupItem value="new" id="new" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  <Label htmlFor="new" className="cursor-pointer text-base font-semibold">
                    Crear cuenta nueva
                  </Label>
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  Importar como una nueva cuenta de {importData.account.bankName}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Existing Accounts */}
        {compatibleAccounts && compatibleAccounts.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">O agregar a una cuenta existente:</p>
            {compatibleAccounts.map((account) => (
              <Card
                key={account.id}
                className={`cursor-pointer transition-all ${
                  selectedAccountId === account.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'hover:border-gray-300'
                }`}
                onClick={() => setSelectedAccountId(account.id)}
              >
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <RadioGroupItem value={account.id} id={account.id} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        <Label
                          htmlFor={account.id}
                          className="cursor-pointer text-base font-semibold"
                        >
                          {account.name}
                        </Label>
                        <Badge variant="secondary">{account.accountType}</Badge>
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm">
                        Balance actual: $
                        {account.currentBalance?.toLocaleString('es-CO', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </RadioGroup>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button onClick={handleContinue} size="lg">
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
