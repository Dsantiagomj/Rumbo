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
  ArrowUpDown,
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
import {
  detectAdditionalAccounts,
  getAccountTypeLabel,
} from '@/features/import/utils/account-detection';
import { logger } from '@/shared/lib/logger';

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
  const [amountFilter, setAmountFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [sortOrder, setSortOrder] = useState<'DESC' | 'ASC'>('DESC'); // DESC = newest first

  // Account suggestions state
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

  // Fetch available categories
  const { data: categories } = trpc.categories.getAll.useQuery();

  const categorizeMutation = trpc.import.categorize.useMutation();

  const confirmImport = trpc.import.confirmImport.useMutation({
    onSuccess: () => {
      // Use window.location.href for context change (import flow → dashboard)
      // This clears import state and refreshes the dashboard
      window.location.href = '/dashboard';
    },
  });

  const appendToAccount = trpc.import.appendToAccount.useMutation({
    onSuccess: () => {
      // Use window.location.href for context change (import flow → dashboard)
      // This clears import state and refreshes the dashboard
      window.location.href = '/dashboard';
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
          logger.error(
            'Error auto-categorizing transactions',
            { transactionCount: importData.transactions.length },
            error as Error,
          );
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

  // Filter and sort transactions (optimized with useMemo to prevent re-renders)
  const filteredTransactions = useMemo(() => {
    const filtered = allTransactions.filter((tx) => {
      // Search filter (by description)
      const matchesSearch =
        searchTerm === '' || tx.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Amount filter (search by amount)
      const matchesAmount = (() => {
        if (amountFilter === '') return true;
        const filterValue = parseFloat(amountFilter);
        if (isNaN(filterValue)) return true;
        return Math.abs(tx.amount) === Math.abs(filterValue);
      })();

      // Type filter
      const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;

      return matchesSearch && matchesAmount && matchesType;
    });

    // Sort by date
    return filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'DESC' ? dateB - dateA : dateA - dateB;
    });
  }, [allTransactions, searchTerm, amountFilter, typeFilter, sortOrder]);

  // Detect additional accounts based on transaction patterns
  const accountSuggestions = useMemo(() => {
    const suggestions = detectAdditionalAccounts(allTransactions);
    // Filter out dismissed suggestions
    return suggestions.filter((s) => !dismissedSuggestions.has(s.type));
  }, [allTransactions, dismissedSuggestions]);

  // Calculate transaction totals
  const totalAmount = allTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalIncome = allTransactions
    .filter((tx) => tx.type === 'INCOME')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpenses = allTransactions
    .filter((tx) => tx.type === 'EXPENSE')
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

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
      logger.error(
        'Error categorizing transactions',
        { transactionCount: allTransactions.length },
        error as Error,
      );
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
          initialBalance: currentBalance, // Current balance confirmed by user
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
          <h3 className="mb-4 text-lg font-semibold">Resumen</h3>

          <div className="space-y-3">
            {/* Bank reported balance */}
            {hasReportedBalance && (
              <div className="bg-muted/50 rounded-lg border p-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Balance reportado (banco):</span>
                  <span className="font-medium">
                    $
                    {importData.account.reportedBalance!.toLocaleString('es-CO', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            )}

            {/* Transaction summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Transacciones en el período ({allTransactions.length}):
                </span>
                <span className="font-medium">
                  {totalAmount >= 0 ? '+' : ''}$
                  {totalAmount.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="ml-4 flex justify-between text-xs">
                <span className="text-muted-foreground">Ingresos:</span>
                <span className="text-green-600">
                  +${totalIncome.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="ml-4 flex justify-between text-xs">
                <span className="text-muted-foreground">Gastos:</span>
                <span className="text-red-600">
                  -${totalExpenses.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* User confirmed balance */}
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="font-semibold">Balance actual (confirmado):</span>
                <span className="text-lg font-bold">
                  ${currentBalance.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                El saldo que ves ahora en tu cuenta
              </p>
            </div>
          </div>

          {/* Balance Mismatch Warning */}
          {balanceMismatch && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                El balance que confirmaste (${currentBalance.toLocaleString('es-CO')}) no coincide
                con el reportado por el banco ($
                {importData.account.reportedBalance!.toLocaleString('es-CO')}). Considera agregar
                transacciones faltantes o actualizar el archivo.
              </AlertDescription>
            </Alert>
          )}
        </Card>
      )}

      {/* Account Suggestions based on transaction patterns */}
      {accountSuggestions.length > 0 && (
        <Card className="border-brand-primary-200 bg-brand-primary-50 dark:bg-brand-primary-950 p-6">
          <div className="mb-4 flex items-start gap-3">
            <Sparkles className="text-brand-primary-600 mt-0.5 h-5 w-5" />
            <div className="flex-1">
              <h3 className="font-semibold">Cuentas sugeridas</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Detectamos patrones que sugieren configurar cuentas adicionales
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {accountSuggestions.map((suggestion) => (
              <Alert key={suggestion.type} variant="default" className="bg-white dark:bg-gray-900">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium">{getAccountTypeLabel(suggestion.type)}</h4>
                    <p className="text-muted-foreground mt-1 text-sm">{suggestion.reason}</p>

                    {/* Show sample transactions */}
                    <div className="mt-2">
                      <p className="text-muted-foreground mb-1 text-xs">
                        Ejemplos encontrados ({suggestion.transactions.length}):
                      </p>
                      <div className="space-y-1">
                        {suggestion.transactions.slice(0, 2).map((tx, idx) => (
                          <div key={idx} className="text-xs">
                            <span className="text-muted-foreground">
                              {new Date(tx.date).toLocaleDateString('es-CO', {
                                month: 'short',
                                day: 'numeric',
                              })}
                              :
                            </span>{' '}
                            {tx.description}
                          </div>
                        ))}
                        {suggestion.transactions.length > 2 && (
                          <p className="text-muted-foreground text-xs">
                            +{suggestion.transactions.length - 2} más
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={
                          suggestion.confidence > 0.8
                            ? 'bg-green-100 text-green-700'
                            : suggestion.confidence > 0.6
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-orange-100 text-orange-700'
                        }
                      >
                        {(suggestion.confidence * 100).toFixed(0)}% confianza
                      </Badge>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newDismissed = new Set(dismissedSuggestions);
                      newDismissed.add(suggestion.type);
                      setDismissedSuggestions(newDismissed);
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </Alert>
            ))}
          </div>

          <div className="mt-4">
            <p className="text-muted-foreground text-xs">
              💡 Puedes configurar estas cuentas después desde el panel de cuentas
            </p>
          </div>
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

          {/* Amount Filter */}
          <div className="relative w-full sm:w-[180px]">
            <Input
              type="number"
              placeholder="Buscar por monto..."
              value={amountFilter}
              onChange={(e) => setAmountFilter(e.target.value)}
            />
            {amountFilter && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-1/2 right-1 -translate-y-1/2"
                onClick={() => setAmountFilter('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="INCOME">Ingresos</SelectItem>
                <SelectItem value="EXPENSE">Gastos</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Order */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'DESC' ? 'ASC' : 'DESC')}
              className="gap-2"
            >
              <ArrowUpDown className="h-4 w-4" />
              {sortOrder === 'DESC' ? 'Más recientes' : 'Más antiguos'}
            </Button>

            {/* Clear Filters */}
            {(searchTerm || amountFilter || typeFilter !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setAmountFilter('');
                  setTypeFilter('ALL');
                }}
              >
                Limpiar
              </Button>
            )}
          </div>
        </div>

        {/* Results Count */}
        {(searchTerm || amountFilter || typeFilter !== 'ALL') && (
          <p className="text-muted-foreground mb-2 text-sm">
            Mostrando {filteredTransactions.length} de {allTransactions.length} transacciones
          </p>
        )}

        <div className="max-h-96 space-y-2 overflow-y-auto">
          {/* Show skeleton during AI categorization */}
          {isAutoCategorizing && (
            <div className="space-y-2">
              {[...Array(Math.min(5, allTransactions.length))].map((_, i) => (
                <Card key={`skeleton-${i}`} className="animate-pulse p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                      <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                    </div>
                    <div className="h-6 w-24 rounded bg-gray-200"></div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Imported Transactions */}
          {!isAutoCategorizing &&
            filteredTransactions.slice(0, importData.transactions.length).map((transaction) => {
              // Find original index for category mapping
              const index = importData.transactions.findIndex(
                (t) =>
                  t.date === transaction.date &&
                  t.description === transaction.description &&
                  t.amount === transaction.amount,
              );

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
                    categories={categories?.map((c) => ({
                      id: c.id,
                      name: c.name,
                      key: c.key,
                      type: c.type as 'EXPENSE' | 'INCOME',
                    }))}
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
          {!isAutoCategorizing &&
            filteredTransactions.slice(importData.transactions.length).map((transaction) => {
              // Find global index for category mapping
              const localIndex = additionalTransactions.findIndex(
                (t) =>
                  t.date === transaction.date &&
                  t.description === transaction.description &&
                  t.amount === transaction.amount,
              );
              const globalIndex = importData.transactions.length + localIndex;

              const categoryId = transactionCategories.get(globalIndex);
              const confidence = categoryConfidences.get(globalIndex);
              const categoryName = categories?.find((c) => c.id === categoryId)?.name;

              return (
                <div key={`additional-${localIndex}`} className="relative">
                  <TransactionPreview
                    transaction={transaction}
                    categoryId={categoryId}
                    categoryName={categoryName}
                    confidence={confidence}
                    categories={categories?.map((c) => ({
                      id: c.id,
                      name: c.name,
                      key: c.key,
                      type: c.type as 'EXPENSE' | 'INCOME',
                    }))}
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
                    onClick={() => handleRemoveTransaction(localIndex)}
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
