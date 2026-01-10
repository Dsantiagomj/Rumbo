'use client';

/**
 * AccountReview Component
 * Review and edit account details before confirming import
 * Shows transaction list and balance reconciliation
 */
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  AlertTriangle,
  Copy,
  Plus,
  XCircle,
  Sparkles,
  Loader2,
  Search,
  X,
} from 'lucide-react';
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
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { trpc } from '@/shared/lib/trpc/client';
import { TransactionPreview } from './transaction-preview';
import { findDuplicates } from '@/features/import/utils/duplicate-detection';
import { ReconciliationModal } from './reconciliation-modal';
import { ManualTransactionForm } from './manual-transaction-form';

interface AccountReviewProps {
  importData: {
    importId: string;
    account: {
      bankName: string;
      accountType: 'SAVINGS' | 'CHECKING' | 'CREDIT_CARD';
      suggestedName: string;
      reportedBalance?: number;
    };
    transactions: Array<{
      date: Date;
      amount: number;
      description: string;
      rawDescription: string;
      type: 'EXPENSE' | 'INCOME';
    }>;
    confidence: number;
  };
  /**
   * Selected account ID
   * - "new": Create a new account
   * - UUID: Append to existing account
   */
  selectedAccountId: string;
}

export function AccountReview({ importData, selectedAccountId }: AccountReviewProps) {
  const router = useRouter();
  const isNewAccount = selectedAccountId === 'new';

  const [accountName, setAccountName] = useState(importData.account.suggestedName);
  const [accountNumber, setAccountNumber] = useState('');
  const [currentBalance, setCurrentBalance] = useState(importData.account.reportedBalance || 0);

  // Reconciliation states
  const [showReconciliationModal, setShowReconciliationModal] = useState(false);
  const [reconciliationMethod, setReconciliationMethod] = useState<
    'OVERRIDE' | 'AI_FIND' | 'MANUAL' | undefined
  >();
  const [additionalTransactions, setAdditionalTransactions] = useState<
    Array<{
      date: Date;
      amount: number;
      description: string;
      rawDescription: string;
      type: 'EXPENSE' | 'INCOME';
    }>
  >([]);

  // Manual transaction form state
  const [showManualForm, setShowManualForm] = useState(false);

  // AI Categorization state
  const [transactionCategories, setTransactionCategories] = useState<Map<number, string>>(
    new Map(),
  );
  const [categoryConfidences, setCategoryConfidences] = useState<Map<number, number>>(new Map());
  const [showCategories, setShowCategories] = useState(true); // Always show categories
  const [isAutoCategorizing, setIsAutoCategorizing] = useState(false);

  // Time gap detection
  const [showTimeGapModal, setShowTimeGapModal] = useState(false);
  const [userAcknowledgedGap, setUserAcknowledgedGap] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  // Fetch available categories
  const { data: categories } = trpc.categories.getAll.useQuery();

  const categorizeMutation = trpc.import.categorize.useMutation();

  const confirmImport = trpc.import.confirmImport.useMutation({
    onSuccess: () => {
      router.push('/dashboard');
    },
  });

  const appendToAccount = trpc.import.appendToAccount.useMutation({
    onSuccess: () => {
      router.push('/dashboard');
    },
  });

  // Fetch existing account data when appending
  const { data: existingAccount } = trpc.accounts.getById.useQuery(
    { id: selectedAccountId },
    { enabled: !isNewAccount && selectedAccountId !== 'new' },
  );

  // Detect duplicates for preview
  const duplicateDetectionResult = useMemo(() => {
    if (!isNewAccount && existingAccount?.transactions) {
      const existingTransactions = existingAccount.transactions.map((tx) => ({
        date: tx.date,
        amount: tx.amount,
        description: tx.description,
      }));

      const newTransactions = importData.transactions.map((tx) => ({
        date: tx.date,
        amount: tx.amount,
        description: tx.description,
      }));

      return findDuplicates(newTransactions, existingTransactions);
    }
    return null;
  }, [isNewAccount, existingAccount, importData.transactions]);

  // Auto-categorize transactions on mount
  useEffect(() => {
    // Only auto-categorize once when categories are first loaded
    async function autoCategorize() {
      if (
        importData.transactions.length > 0 &&
        categories &&
        categories.length > 0 &&
        transactionCategories.size === 0 &&
        !isAutoCategorizing
      ) {
        try {
          setIsAutoCategorizing(true);
          const results = await categorizeMutation.mutateAsync({
            transactions: importData.transactions.map((tx) => ({
              description: tx.description,
              amount: tx.amount,
              type: tx.type,
            })),
          });

          const newCategories = new Map<number, string>();
          const newConfidences = new Map<number, number>();

          results.forEach((result) => {
            if (result.categoryId && result.confidence > 0.5) {
              newCategories.set(result.index, result.categoryId);
              newConfidences.set(result.index, result.confidence);
            }
          });

          setTransactionCategories(newCategories);
          setCategoryConfidences(newConfidences);
        } catch (error) {
          console.error('Error auto-categorizing transactions:', error);
        } finally {
          setIsAutoCategorizing(false);
        }
      }
    }

    autoCategorize();
  }, [
    categories,
    importData.transactions,
    transactionCategories.size,
    isAutoCategorizing,
    categorizeMutation,
  ]);

  // Combine imported and additional transactions
  const allTransactions = [...importData.transactions, ...additionalTransactions];

  // Calculate time gap between last transaction and today
  const timeGapInfo = useMemo(() => {
    if (allTransactions.length === 0) return null;

    // Find the most recent transaction date
    const mostRecentTransaction = allTransactions.reduce((latest, tx) => {
      return tx.date > latest.date ? tx : latest;
    });

    const lastTransactionDate = new Date(mostRecentTransaction.date);
    const today = new Date();

    // Calculate days between last transaction and today
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysDifference = Math.floor((today.getTime() - lastTransactionDate.getTime()) / msPerDay);

    // Only show warning if gap is > 1 day
    if (daysDifference > 1) {
      return {
        daysMissing: daysDifference,
        lastTransactionDate: lastTransactionDate,
        today: today,
      };
    }

    return null;
  }, [allTransactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((tx) => {
      // Search filter
      const matchesSearch =
        searchTerm === '' || tx.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Type filter
      const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [allTransactions, searchTerm, typeFilter]);

  // Calculate initial balance (working backwards from current balance)
  const totalAmount = allTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const calculatedInitialBalance = currentBalance - totalAmount;

  // Check if balance matches reported balance
  const hasReportedBalance = importData.account.reportedBalance !== undefined;
  const balanceMismatch =
    hasReportedBalance && Math.abs(currentBalance - importData.account.reportedBalance!) > 0.01;

  const handleReconciliationConfirm = (
    method: 'OVERRIDE' | 'AI_FIND' | 'MANUAL',
    suggestedTransactions?: Array<{
      date: Date;
      description: string;
      amount: number;
      type: 'EXPENSE' | 'INCOME';
    }>,
  ) => {
    setReconciliationMethod(method);
    setShowReconciliationModal(false);

    if (method === 'AI_FIND' && suggestedTransactions) {
      // Add AI suggested transactions
      const formattedTransactions = suggestedTransactions.map((tx) => ({
        ...tx,
        rawDescription: tx.description,
      }));
      setAdditionalTransactions([...additionalTransactions, ...formattedTransactions]);
    } else if (method === 'MANUAL') {
      // Show manual form
      setShowManualForm(true);
    }
  };

  const handleAddManualTransaction = (transaction: {
    date: Date;
    description: string;
    amount: number;
    type: 'EXPENSE' | 'INCOME';
  }) => {
    setAdditionalTransactions([
      ...additionalTransactions,
      {
        ...transaction,
        rawDescription: transaction.description,
      },
    ]);
  };

  const handleRemoveTransaction = (index: number) => {
    setAdditionalTransactions(additionalTransactions.filter((_, i) => i !== index));
  };

  const handleAutoCategorize = async () => {
    try {
      setIsAutoCategorizing(true);
      const results = await categorizeMutation.mutateAsync({
        transactions: allTransactions.map((tx) => ({
          description: tx.description,
          amount: tx.amount,
          type: tx.type,
        })),
      });

      const newCategories = new Map<number, string>();
      const newConfidences = new Map<number, number>();

      results.forEach((result) => {
        if (result.categoryId && result.confidence > 0.5) {
          newCategories.set(result.index, result.categoryId);
          newConfidences.set(result.index, result.confidence);
        }
      });

      setTransactionCategories(newCategories);
      setCategoryConfidences(newConfidences);
      setShowCategories(true);
    } catch (error) {
      console.error('Error categorizing transactions:', error);
    } finally {
      setIsAutoCategorizing(false);
    }
  };

  const handleCategoryChange = (index: number, categoryId: string) => {
    const newCategories = new Map(transactionCategories);
    if (categoryId) {
      newCategories.set(index, categoryId);
    } else {
      newCategories.delete(index);
    }
    setTransactionCategories(newCategories);
  };

  const handleConfirm = async () => {
    // Check for time gap before confirming (only for new accounts)
    if (isNewAccount && timeGapInfo && !userAcknowledgedGap) {
      setShowTimeGapModal(true);
      return;
    }

    // Check for balance mismatch before confirming (only for new accounts)
    if (isNewAccount && balanceMismatch && !reconciliationMethod) {
      setShowReconciliationModal(true);
      return;
    }

    if (isNewAccount) {
      // Create new account
      await confirmImport.mutateAsync({
        importId: importData.importId,
        accountData: {
          name: accountName,
          bankName: importData.account.bankName,
          accountType: importData.account.accountType,
          accountNumber: accountNumber || undefined,
          initialBalance: calculatedInitialBalance, // Calculated from current balance
        },
        transactions: allTransactions.map((tx, index) => ({
          date: tx.date,
          amount: tx.amount,
          description: tx.description,
          rawDescription: tx.rawDescription,
          type: tx.type,
          categoryId: transactionCategories.get(index),
        })),
        reconciliationMethod: reconciliationMethod || (balanceMismatch ? 'OVERRIDE' : undefined),
      });
    } else {
      // Append to existing account
      await appendToAccount.mutateAsync({
        accountId: selectedAccountId,
        importId: importData.importId,
        transactions: allTransactions.map((tx, index) => ({
          date: tx.date,
          amount: tx.amount,
          description: tx.description,
          rawDescription: tx.rawDescription,
          type: tx.type,
          categoryId: transactionCategories.get(index),
        })),
        skipDuplicates: true,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Details Form - Only for new accounts */}
      {isNewAccount && (
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Detalles de la cuenta</h2>

          <div className="space-y-4">
            {/* Bank Name (Read-only) */}
            <div>
              <Label>Banco</Label>
              <Input value={importData.account.bankName} disabled className="bg-muted" />
            </div>

            {/* Account Type (Read-only) */}
            <div>
              <Label>Tipo de cuenta</Label>
              <Select value={importData.account.accountType} disabled>
                <SelectTrigger className="bg-muted">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAVINGS">Ahorros</SelectItem>
                  <SelectItem value="CHECKING">Corriente</SelectItem>
                  <SelectItem value="CREDIT_CARD">Tarjeta de Crédito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Account Name (Editable) */}
            <div>
              <Label htmlFor="accountName">Nombre de la cuenta *</Label>
              <Input
                id="accountName"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Ej: Ahorros Principal"
              />
            </div>

            {/* Account Number (Optional) */}
            <div>
              <Label htmlFor="accountNumber">Número de cuenta (opcional)</Label>
              <Input
                id="accountNumber"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Últimos 4 dígitos"
              />
            </div>

            {/* Current Balance */}
            <div>
              <Label htmlFor="currentBalance">Balance actual *</Label>
              <Input
                id="currentBalance"
                type="number"
                value={currentBalance}
                onChange={(e) => setCurrentBalance(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
              <p className="text-muted-foreground mt-1 text-sm">
                El saldo que tienes ahora en tu cuenta (puedes verificarlo en tu app de banco)
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Info Alert for Appending to Existing Account */}
      {!isNewAccount && duplicateDetectionResult && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
              <div className="flex-1">
                <h3 className="font-semibold">Agregando a cuenta existente</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  {existingAccount?.name || 'Cuenta seleccionada'}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border bg-green-50 p-4 dark:bg-green-950">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {duplicateDetectionResult.unique.length}
                  </div>
                  <p className="text-muted-foreground text-sm">Transacciones nuevas</p>
                </div>

                <div className="rounded-lg border bg-orange-50 p-4 dark:bg-orange-950">
                  <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                    {duplicateDetectionResult.duplicates.length}
                  </div>
                  <p className="text-muted-foreground text-sm">Duplicados detectados</p>
                </div>
              </div>
            </div>

            {duplicateDetectionResult.duplicates.length > 0 && (
              <Alert
                variant="default"
                className="border-orange-200 bg-orange-50 dark:bg-orange-950"
              >
                <Copy className="h-4 w-4" />
                <AlertDescription>
                  Se detectaron {duplicateDetectionResult.duplicates.length} transacciones
                  duplicadas que serán omitidas automáticamente.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </Card>
      )}

      {!isNewAccount && !duplicateDetectionResult && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Las transacciones se agregarán a la cuenta existente. Se detectarán y omitirán
            automáticamente las transacciones duplicadas.
          </AlertDescription>
        </Alert>
      )}

      {/* Balance Summary - Only for new accounts */}
      {isNewAccount && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Resumen de Balance</h3>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Balance actual (ahora):</span>
              <span className="font-medium">
                ${currentBalance.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Transacciones del período ({importData.transactions.length}):
              </span>
              <span
                className={`font-medium ${totalAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {totalAmount >= 0 ? '+' : ''}$
                {totalAmount.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Balance inicial calculado:</span>
                <span className="font-bold">
                  ${calculatedInitialBalance.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Este es el saldo que tenías antes de estas transacciones
              </p>
            </div>

            {hasReportedBalance && (
              <div className="mt-4 flex justify-between text-sm">
                <span className="text-muted-foreground">Balance reportado por el banco:</span>
                <span>
                  $
                  {importData.account.reportedBalance!.toLocaleString('es-CO', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Balance Mismatch Warning */}
          {balanceMismatch && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                El balance actual que ingresaste no coincide con el reportado por el banco. Verifica
                que sea correcto antes de continuar.
              </AlertDescription>
            </Alert>
          )}
        </Card>
      )}

      {/* Transactions List */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Transacciones ({allTransactions.length})</h3>

          <div className="flex gap-2">
            {!isNewAccount && duplicateDetectionResult && (
              <>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {duplicateDetectionResult.unique.length} nuevas
                </Badge>
                {duplicateDetectionResult.duplicates.length > 0 && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    {duplicateDetectionResult.duplicates.length} duplicados
                  </Badge>
                )}
              </>
            )}
            {additionalTransactions.length > 0 && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {additionalTransactions.length} agregadas
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-4 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowManualForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar transacción
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoCategorize}
            disabled={isAutoCategorizing || allTransactions.length === 0}
          >
            {isAutoCategorizing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Categorizando...
              </>
            ) : transactionCategories.size > 0 ? (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Re-categorizar con IA
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Categorizar con IA
              </>
            )}
          </Button>

          {showCategories && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTransactionCategories(new Map());
                setCategoryConfidences(new Map());
                setShowCategories(false);
              }}
            >
              Limpiar categorías
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Buscar por descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-1/2 right-1 -translate-y-1/2"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="INCOME">Ingresos</SelectItem>
                <SelectItem value="EXPENSE">Gastos</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchTerm || typeFilter !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('ALL');
                }}
              >
                Limpiar
              </Button>
            )}
          </div>
        </div>

        {/* Results Count */}
        {(searchTerm || typeFilter !== 'ALL') && (
          <p className="text-muted-foreground mb-2 text-sm">
            Mostrando {filteredTransactions.length} de {allTransactions.length} transacciones
          </p>
        )}

        <div className="max-h-96 space-y-2 overflow-y-auto">
          {/* Imported Transactions */}
          {importData.transactions.map((transaction, index) => {
            // Apply filters
            const matchesSearch =
              searchTerm === '' ||
              transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === 'ALL' || transaction.type === typeFilter;

            if (!matchesSearch || !matchesType) return null;

            const isDuplicate =
              !isNewAccount &&
              duplicateDetectionResult?.duplicates.some(
                (dup) =>
                  dup.date.getTime() === transaction.date.getTime() &&
                  dup.amount === transaction.amount &&
                  dup.description === transaction.description,
              );

            const categoryId = transactionCategories.get(index);
            const confidence = categoryConfidences.get(index);
            const categoryName = categories?.find((c) => c.id === categoryId)?.name;

            return (
              <div key={`imported-${index}`} className={isDuplicate ? 'relative' : ''}>
                <TransactionPreview
                  transaction={transaction}
                  categoryId={categoryId}
                  categoryName={categoryName}
                  confidence={confidence}
                  categories={categories?.map((c) => ({ id: c.id, name: c.name, key: c.key }))}
                  onCategoryChange={(newCategoryId) => handleCategoryChange(index, newCategoryId)}
                  editable={showCategories}
                />
                {isDuplicate && (
                  <Badge
                    variant="secondary"
                    className="absolute top-2 right-2 bg-orange-100 text-orange-700"
                  >
                    Duplicado
                  </Badge>
                )}
              </div>
            );
          })}

          {/* Additional Transactions */}
          {additionalTransactions.map((transaction, index) => {
            // Apply filters
            const matchesSearch =
              searchTerm === '' ||
              transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === 'ALL' || transaction.type === typeFilter;

            if (!matchesSearch || !matchesType) return null;

            const globalIndex = importData.transactions.length + index;
            const categoryId = transactionCategories.get(globalIndex);
            const confidence = categoryConfidences.get(globalIndex);
            const categoryName = categories?.find((c) => c.id === categoryId)?.name;

            return (
              <div key={`additional-${index}`} className="relative">
                <TransactionPreview
                  transaction={transaction}
                  categoryId={categoryId}
                  categoryName={categoryName}
                  confidence={confidence}
                  categories={categories?.map((c) => ({ id: c.id, name: c.name, key: c.key }))}
                  onCategoryChange={(newCategoryId) =>
                    handleCategoryChange(globalIndex, newCategoryId)
                  }
                  editable={showCategories}
                />
                <Badge
                  variant="secondary"
                  className="absolute top-2 right-2 bg-purple-100 text-purple-700"
                >
                  Agregada
                </Badge>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-2 right-20"
                  onClick={() => handleRemoveTransaction(index)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            );
          })}

          {/* No results */}
          {filteredTransactions.length === 0 && (
            <div className="text-muted-foreground py-8 text-center">
              <p>No se encontraron transacciones con los filtros aplicados</p>
            </div>
          )}
        </div>
      </Card>

      {/* Confidence Score */}
      {importData.confidence < 0.9 && (
        <Alert>
          <AlertDescription>
            Confianza de detección: {(importData.confidence * 100).toFixed(0)}%. Por favor, revisa
            cuidadosamente los datos antes de confirmar.
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={confirmImport.isPending || appendToAccount.isPending}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={
            (isNewAccount && !accountName) || confirmImport.isPending || appendToAccount.isPending
          }
          className="flex-1"
        >
          {confirmImport.isPending || appendToAccount.isPending ? (
            'Confirmando...'
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {isNewAccount ? 'Confirmar Importación' : 'Agregar Transacciones'}
            </>
          )}
        </Button>
      </div>

      {/* Error Display */}
      {(confirmImport.error || appendToAccount.error) && (
        <Alert variant="destructive">
          <AlertDescription>
            {confirmImport.error?.message || appendToAccount.error?.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Reconciliation Modal */}
      {isNewAccount && (
        <ReconciliationModal
          isOpen={showReconciliationModal}
          onClose={() => setShowReconciliationModal(false)}
          reportedBalance={importData.account.reportedBalance || 0}
          calculatedBalance={currentBalance}
          importId={importData.importId}
          transactions={allTransactions}
          onConfirm={handleReconciliationConfirm}
        />
      )}

      {/* Manual Transaction Form */}
      <ManualTransactionForm
        isOpen={showManualForm}
        onClose={() => setShowManualForm(false)}
        onAdd={handleAddManualTransaction}
      />

      {/* Time Gap Warning Modal */}
      {timeGapInfo && (
        <Dialog open={showTimeGapModal} onOpenChange={setShowTimeGapModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Hay transacciones faltantes
              </DialogTitle>
              <DialogDescription>
                El estado de cuenta que subiste está desactualizado
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950">
                <AlertDescription className="text-sm">
                  <div className="space-y-2">
                    <p className="font-semibold">
                      📅 Tu estado de cuenta termina el{' '}
                      {timeGapInfo.lastTransactionDate.toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <p>
                      Pero hoy es{' '}
                      {timeGapInfo.today.toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-orange-700">
                      <strong>Faltan {timeGapInfo.daysMissing} días de movimientos</strong> que no
                      están registrados en el documento.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <p className="text-sm font-medium">¿Qué deseas hacer?</p>

                <div className="space-y-2">
                  {/* Option 1: Add missing transactions */}
                  <Button
                    variant="outline"
                    className="h-auto w-full justify-start p-4 text-left"
                    onClick={() => {
                      setShowTimeGapModal(false);
                      setShowManualForm(true);
                    }}
                  >
                    <div className="flex-1">
                      <div className="font-semibold">Agregar transacciones manualmente</div>
                      <p className="text-muted-foreground text-sm">
                        Agrega los movimientos del{' '}
                        {new Date(
                          timeGapInfo.lastTransactionDate.getTime() + 86400000,
                        ).toLocaleDateString('es-CO', {
                          day: 'numeric',
                          month: 'long',
                        })}{' '}
                        al{' '}
                        {timeGapInfo.today.toLocaleDateString('es-CO', {
                          day: 'numeric',
                          month: 'long',
                        })}
                      </p>
                    </div>
                  </Button>

                  {/* Option 2: Confirm no movements */}
                  <Button
                    variant="outline"
                    className="h-auto w-full justify-start p-4 text-left"
                    onClick={() => {
                      setUserAcknowledgedGap(true);
                      setShowTimeGapModal(false);
                      // Continue with confirmation
                      handleConfirm();
                    }}
                  >
                    <div className="flex-1">
                      <div className="font-semibold">
                        Confirmar que no hubo movimientos en este período
                      </div>
                      <p className="text-muted-foreground text-sm">
                        No tuve ningún ingreso ni gasto en estos {timeGapInfo.daysMissing} días
                      </p>
                    </div>
                  </Button>

                  {/* Option 3: Continue anyway */}
                  <Button
                    variant="ghost"
                    className="h-auto w-full justify-start p-4 text-left"
                    onClick={() => {
                      setUserAcknowledgedGap(true);
                      setShowTimeGapModal(false);
                      // Continue with confirmation
                      handleConfirm();
                    }}
                  >
                    <div className="flex-1">
                      <div className="font-semibold">Continuar de todos modos</div>
                      <p className="text-muted-foreground text-sm">
                        Sé que faltan transacciones, las agregaré después
                      </p>
                    </div>
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertDescription className="text-xs">
                  💡 <strong>Recomendación:</strong> Para tener un registro completo y preciso,
                  descarga el estado de cuenta más reciente de tu banco o agrega manualmente las
                  transacciones faltantes.
                </AlertDescription>
              </Alert>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
