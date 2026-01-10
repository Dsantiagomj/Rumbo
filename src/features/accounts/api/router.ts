/**
 * Accounts Router
 * CRUD operations for bank accounts
 */
import { z } from 'zod';
import { router, protectedProcedure } from '@/shared/lib/trpc/init';

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
   * Get account by ID with transactions
   */
  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
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
          take: 50,
        },
      },
    });
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
