'use client';

/**
 * Final Review Step (Step 4)
 * Shows complete transaction list with filters
 * Allows final edits before confirming import
 */
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
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
  CheckCircle2,
  Search,
  X,
  ArrowUpDown,
  Loader2,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';
import { TransactionPreview } from '../transaction-preview';
import { trpc } from '@/shared/lib/trpc/client';
import type { ParsedImportData, WizardData } from '../import-wizard';

interface FinalReviewStepProps {
  importData: ParsedImportData;
  wizardData: WizardData;
  onDataUpdate: (updates: Partial<WizardData>) => void;
  onBack: () => void;
}

export function FinalReviewStep({
  importData,
  wizardData,
  onDataUpdate,
  onBack,
}: FinalReviewStepProps) {
  const router = useRouter();
  const { data: categories } = trpc.categories.getAll.useQuery();
  const confirmImport = trpc.import.confirmImport.useMutation();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [amountFilter, setAmountFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [sortOrder, setSortOrder] = useState<'DESC' | 'ASC'>('DESC');

  // Combine all transactions
  const allTransactions = useMemo(() => {
    return [...importData.transactions, ...wizardData.additionalTransactions];
  }, [importData.transactions, wizardData.additionalTransactions]);

  // Filter and sort
  const filteredTransactions = useMemo(() => {
    const filtered = allTransactions.filter((tx) => {
      const matchesSearch =
        searchTerm === '' || tx.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAmount = (() => {
        if (amountFilter === '') return true;
        const filterValue = parseFloat(amountFilter);
        if (isNaN(filterValue)) return true;
        return Math.abs(tx.amount) === Math.abs(filterValue);
      })();

      const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;
      return matchesSearch && matchesAmount && matchesType;
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'DESC' ? dateB - dateA : dateA - dateB;
    });
  }, [allTransactions, searchTerm, amountFilter, typeFilter, sortOrder]);

  // Calculate summary
  const summary = useMemo(() => {
    const totalIncome = allTransactions
      .filter((tx) => tx.type === 'INCOME')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalExpenses = allTransactions
      .filter((tx) => tx.type === 'EXPENSE')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const netChange = totalIncome - totalExpenses;

    // The user's balance is the REAL balance (what they indicated)
    const actualBalance = wizardData.initialBalance;

    // If there's a reported balance from the PDF, compare
    const reportedBalance = importData.account.reportedBalance;
    const hasDiscrepancy =
      reportedBalance !== null && Math.abs(reportedBalance - actualBalance) > 0.01;

    return {
      totalIncome,
      totalExpenses,
      netChange,
      actualBalance, // This is the user's real balance
      reportedBalance,
      hasDiscrepancy,
      transactionCount: allTransactions.length,
    };
  }, [allTransactions, wizardData.initialBalance, importData.account.reportedBalance]);

  const handleConfirm = async () => {
    try {
      await confirmImport.mutateAsync({
        importId: importData.importId,
        accountData: {
          name: wizardData.accountName,
          bankName: importData.account.bankName,
          accountType: wizardData.accountType,
          accountNumber: importData.account.accountNumber,
          initialBalance: wizardData.initialBalance,
        },
        transactions: allTransactions.map((tx, index) => ({
          ...tx,
          categoryId: wizardData.transactionCategories.get(index),
        })),
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error confirming import:', error);
    }
  };

  const handleCategoryChange = (index: number, categoryId: string) => {
    const updatedCategories = new Map(wizardData.transactionCategories);
    updatedCategories.set(index, categoryId);
    onDataUpdate({ transactionCategories: updatedCategories });
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Ingresos</p>
              <p className="text-2xl font-bold text-green-600">
                $
                {summary.totalIncome.toLocaleString('es-CO', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Gastos</p>
              <p className="text-2xl font-bold text-red-600">
                $
                {summary.totalExpenses.toLocaleString('es-CO', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Balance Actual</p>
              <p
                className={`text-2xl font-bold ${summary.actualBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                $
                {summary.actualBalance.toLocaleString('es-CO', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${summary.actualBalance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}
            >
              <CheckCircle2
                className={`h-6 w-6 ${summary.actualBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Balance Discrepancy Warning */}
      {summary.hasDiscrepancy && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Advertencia:</strong> El balance que indicaste ($
            {summary.actualBalance.toLocaleString('es-CO', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            ) difiere del balance reportado en el extracto ($
            {summary.reportedBalance?.toLocaleString('es-CO', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            ). Esto puede deberse a transacciones faltantes u otras razones. Tu balance indicado
            será usado como el balance real.
          </AlertDescription>
        </Alert>
      )}

      {/* Transactions Section */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Transacciones ({filteredTransactions.length})</h3>
          <Badge variant="secondary">{summary.transactionCount} total</Badge>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
            <Input
              placeholder="Buscar transacciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-muted-foreground hover:text-foreground absolute top-2.5 right-3"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Amount Filter */}
          <div className="relative w-[150px]">
            <span className="text-muted-foreground absolute top-2.5 left-3">$</span>
            <Input
              type="number"
              placeholder="Filtrar por monto"
              value={amountFilter}
              onChange={(e) => setAmountFilter(e.target.value)}
              className="pl-6"
            />
            {amountFilter && (
              <button
                onClick={() => setAmountFilter('')}
                className="text-muted-foreground hover:text-foreground absolute top-2.5 right-3"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as 'ALL' | 'INCOME' | 'EXPENSE')}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas</SelectItem>
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
        </div>

        {/* Transaction List */}
        <div className="max-h-[500px] space-y-2 overflow-y-auto">
          {filteredTransactions.map((transaction, displayIndex) => {
            // Find the actual index in allTransactions for category mapping
            const actualIndex = allTransactions.findIndex(
              (t) =>
                t.date === transaction.date &&
                t.description === transaction.description &&
                t.amount === transaction.amount,
            );

            const categoryId = wizardData.transactionCategories.get(actualIndex);
            const categoryName = categories?.find((c) => c.id === categoryId)?.name;
            const confidence = wizardData.categoryConfidences.get(actualIndex);

            return (
              <TransactionPreview
                key={`${actualIndex}-${displayIndex}`}
                transaction={transaction}
                categoryId={categoryId}
                categoryName={categoryName}
                confidence={confidence}
                categories={categories
                  ?.filter((c) => c.type === transaction.type)
                  .map((c) => ({
                    id: c.id,
                    name: c.name,
                    key: c.key,
                    type: c.type as 'EXPENSE' | 'INCOME',
                  }))}
                onCategoryChange={(newCategoryId) =>
                  handleCategoryChange(actualIndex, newCategoryId)
                }
                editable
              />
            );
          })}

          {filteredTransactions.length === 0 && (
            <div className="text-muted-foreground py-8 text-center">
              <p>No se encontraron transacciones con los filtros aplicados</p>
            </div>
          )}
        </div>
      </Card>

      {/* Final Actions */}
      <div className="flex justify-between gap-3">
        <Button variant="outline" onClick={onBack} disabled={confirmImport.isPending}>
          Atrás
        </Button>
        <Button
          onClick={handleConfirm}
          size="lg"
          disabled={confirmImport.isPending}
          className="min-w-[150px]"
        >
          {confirmImport.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importando...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirmar Importación
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
