'use client';

import { trpc } from '@/shared/lib/trpc/client';
import type { AppRouter } from '@/shared/lib/trpc/root';
import type { inferRouterOutputs } from '@trpc/server';

type RouterOutputs = inferRouterOutputs<AppRouter>;

/**
 * Hook for paginated transactions with infinite scroll support
 *
 * @example
 * const { transactions, loadMore, hasMore, isLoading } = useTransactionsPagination({
 *   accountId: 'account-123',
 *   limit: 50,
 * });
 */

export interface UseTransactionsPaginationOptions {
  accountId: string;
  limit?: number;
  sortBy?: 'date' | 'amount';
  sortOrder?: 'asc' | 'desc';
  type?: 'EXPENSE' | 'INCOME';
  categoryId?: string;
  searchTerm?: string;
  startDate?: Date;
  endDate?: Date;
}

export type Transaction = RouterOutputs['accounts']['getTransactions']['items'][number];

export function useTransactionsPagination(options: UseTransactionsPaginationOptions) {
  const { accountId, limit = 50, ...filters } = options;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    trpc.accounts.getTransactions.useInfiniteQuery(
      {
        accountId,
        limit,
        ...filters,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
      },
    );

  // Flatten all pages into a single array of transactions
  const transactions: Transaction[] = data?.pages.flatMap((page) => page.items) ?? [];

  // Total count from the first page
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  return {
    transactions,
    totalCount,
    loadMore: fetchNextPage,
    hasMore: hasNextPage ?? false,
    isLoadingMore: isFetchingNextPage,
    isLoading,
    isError,
    error,
  };
}
