'use client';

/**
 * AccountsList Component
 * Displays user's bank accounts with balances
 * Shows empty state with CTA to import first account
 */
import Link from 'next/link';
import { Wallet, CreditCard, ArrowRight, Plus } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { trpc } from '@/shared/lib/trpc/client';

const ACCOUNT_TYPE_LABELS = {
  SAVINGS: 'Ahorros',
  CHECKING: 'Corriente',
  CREDIT_CARD: 'Tarjeta de Crédito',
} as const;

const ACCOUNT_TYPE_ICONS = {
  SAVINGS: Wallet,
  CHECKING: Wallet,
  CREDIT_CARD: CreditCard,
} as const;

export function AccountsList() {
  const { data: accounts, isLoading } = trpc.accounts.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-muted h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  // Empty State
  if (!accounts || accounts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <Wallet className="text-muted-foreground h-8 w-8" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No tienes cuentas registradas</h3>
        <p className="text-muted-foreground mb-6 text-sm">
          Importa tu primer estado de cuenta para comenzar a rastrear tus finanzas
        </p>
        <Link href="/crear-cuenta">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Importar Estado de Cuenta
          </Button>
        </Link>
      </Card>
    );
  }

  // Accounts List
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Mis Cuentas</h2>
        <Link href="/crear-cuenta">
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Agregar cuenta
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => {
          const Icon = ACCOUNT_TYPE_ICONS[account.accountType as keyof typeof ACCOUNT_TYPE_ICONS];
          const typeLabel =
            ACCOUNT_TYPE_LABELS[account.accountType as keyof typeof ACCOUNT_TYPE_LABELS];

          return (
            <Link key={account.id} href={`/accounts/${account.id}`}>
              <Card className="group cursor-pointer p-6 transition-all hover:shadow-lg">
                <div className="mb-4 flex items-start justify-between">
                  <div className="bg-brand-primary-100 flex h-12 w-12 items-center justify-center rounded-full">
                    <Icon className="text-brand-primary-600 h-6 w-6" />
                  </div>
                  <ArrowRight className="text-muted-foreground h-5 w-5 transition-transform group-hover:translate-x-1" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-semibold">{account.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {account.bankName} · {typeLabel}
                  </p>
                </div>

                <div className="mt-4 border-t pt-4">
                  <p className="text-muted-foreground mb-1 text-xs">Balance actual</p>
                  <p className="text-2xl font-bold">
                    ${account.currentBalance.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                {account._count && account._count.transactions > 0 && (
                  <p className="text-muted-foreground mt-2 text-xs">
                    {account._count.transactions} transacciones
                  </p>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
