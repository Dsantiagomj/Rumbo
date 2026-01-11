/**
 * Accounts Router
 * CRUD operations for bank accounts
 */
import { z } from 'zod';
import { router, protectedProcedure } from '@/shared/lib/trpc/init';
import { positiveIntegerSchema } from '@/shared/lib/validation';

export const accountsRouter = router({
  /**
   * Get all active accounts for current user
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.bankAccount.findMany({
      where: {
        userId: ctx.session.user.id,
        isActive: true,
      },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }),

  /**
   * Get account by ID with recent transactions
   * Use getTransactions for paginated access to all transactions
   */
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid('ID de cuenta inválido'),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.bankAccount.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          transactions: {
            include: {
              category: true,
            },
            orderBy: { date: 'desc' },
            take: 10, // Reduced to 10 for initial load, use getTransactions for more
          },
        },
      });
    }),

  /**
   * Get paginated transactions for an account
   * Supports cursor-based pagination for efficient large dataset handling
   */
  getTransactions: protectedProcedure
    .input(
      z.object({
        accountId: z.string().uuid('ID de cuenta inválido'),
        limit: positiveIntegerSchema.max(100).default(50),
        cursor: z.string().uuid().optional(), // Transaction ID for cursor
        sortBy: z.enum(['date', 'amount']).default('date'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
        // Optional filters
        type: z.enum(['EXPENSE', 'INCOME']).optional(),
        categoryId: z.string().uuid().optional(),
        searchTerm: z.string().max(200).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        accountId,
        limit,
        cursor,
        sortBy,
        sortOrder,
        type,
        categoryId,
        searchTerm,
        startDate,
        endDate,
      } = input;

      // Build where clause with filters
      const where = {
        accountId,
        userId: ctx.session.user.id,
        ...(type && { type }),
        ...(categoryId && { categoryId }),
        ...(searchTerm && {
          description: {
            contains: searchTerm,
            mode: 'insensitive' as const,
          },
        }),
        ...((startDate || endDate) && {
          date: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        }),
      };

      // Build orderBy
      const orderBy =
        sortBy === 'date' ? { date: sortOrder, createdAt: sortOrder } : { amount: sortOrder };

      // Fetch transactions with cursor
      const transactions = await ctx.db.transaction.findMany({
        where,
        include: {
          category: true,
        },
        orderBy,
        take: limit + 1, // Fetch one extra to determine if there's a next page
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0, // Skip the cursor itself
      });

      // Check if there's a next page
      const hasNextPage = transactions.length > limit;
      const items = hasNextPage ? transactions.slice(0, limit) : transactions;

      // Get next cursor
      const nextCursor = hasNextPage ? items[items.length - 1].id : null;

      // Get total count for the account (without pagination)
      const totalCount = await ctx.db.transaction.count({
        where: {
          accountId,
          userId: ctx.session.user.id,
        },
      });

      return {
        items,
        nextCursor,
        hasNextPage,
        totalCount,
      };
    }),

  /**
   * Create new bank account manually
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        bankName: z.string(),
        accountType: z.enum(['SAVINGS', 'CHECKING', 'CREDIT_CARD']),
        accountNumber: z.string().optional(),
        initialBalance: z.number(),
        currentBalance: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.bankAccount.create({
        data: {
          userId: ctx.session.user.id,
          name: input.name,
          bankName: input.bankName,
          accountType: input.accountType,
          accountNumber: input.accountNumber,
          initialBalance: input.initialBalance,
          currentBalance: input.currentBalance,
          importSource: 'MANUAL',
        },
      });
    }),

  /**
   * Update account (name, active status)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      return await ctx.db.bankAccount.update({
        where: { id },
        data,
      });
    }),
});
