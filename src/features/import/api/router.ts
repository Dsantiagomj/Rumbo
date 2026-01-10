/**
 * Import Router
 * Handles bank statement parsing (CSV/PDF) and import confirmation
 */
import { z } from 'zod';
import { router, protectedProcedure } from '@/shared/lib/trpc/init';
import { parseBankCSV } from '@/shared/lib/bank-parser';
import { parseBankPDF } from '@/features/import/utils/pdf-ocr';
import { categorizeTransactions } from '@/features/import/utils/ai-categorization';
import { findDuplicates } from '@/features/import/utils/duplicate-detection';
import { suggestMissingTransactions } from '@/features/import/utils/ai-reconciliation';

export const importRouter = router({
  /**
   * Parse CSV file
   * Detects bank format and parses transactions
   */
  parseCSV: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileContent: z.string(), // base64 encoded
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Decode base64
        const csvText = Buffer.from(input.fileContent, 'base64').toString('utf-8');

        // Parse CSV
        const result = await parseBankCSV(csvText);

        if (!result) {
          throw new Error('No se pudo detectar el formato del banco');
        }

        // Create import record
        const importRecord = await ctx.db.dataImport.create({
          data: {
            userId: ctx.session.user.id,
            fileName: input.fileName,
            fileType: 'CSV',
            status: 'COMPLETED',
            detectedBank: result.account.bankName,
            reportedBalance: result.account.reportedBalance,
            transactionsFound: result.transactions.length,
          },
        });

        return {
          importId: importRecord.id,
          account: result.account,
          transactions: result.transactions,
          confidence: result.confidence,
        };
      } catch (error) {
        // Create failed import record
        await ctx.db.dataImport.create({
          data: {
            userId: ctx.session.user.id,
            fileName: input.fileName,
            fileType: 'CSV',
            status: 'FAILED',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        });

        throw error;
      }
    }),

  /**
   * Parse PDF file with OCR
   * Uses OpenAI Vision API
   * Note: Expects PNG image data (PDF to PNG conversion happens on client side)
   * Password handling for protected PDFs is done client-side
   */
  parsePDF: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileContent: z.union([
          z.string(), // Single page (backwards compatible)
          z.array(z.string()), // Multiple pages
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Parse PNG image(s) with OpenAI Vision
        // Note: PDF to PNG conversion and password handling done client-side
        const pngPages = Array.isArray(input.fileContent) ? input.fileContent : [input.fileContent];
        const result = await parseBankPDF(pngPages);

        // Create import record
        const importRecord = await ctx.db.dataImport.create({
          data: {
            userId: ctx.session.user.id,
            fileName: input.fileName,
            fileType: 'PDF',
            status: 'COMPLETED',
            detectedBank: result.account.bankName,
            reportedBalance: result.account.reportedBalance,
            transactionsFound: result.transactions.length,
          },
        });

        return {
          importId: importRecord.id,
          account: result.account,
          transactions: result.transactions,
          confidence: result.confidence,
        };
      } catch (error) {
        await ctx.db.dataImport.create({
          data: {
            userId: ctx.session.user.id,
            fileName: input.fileName,
            fileType: 'PDF',
            status: 'FAILED',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        });

        throw error;
      }
    }),

  /**
   * Confirm import and create account + transactions
   */
  confirmImport: protectedProcedure
    .input(
      z.object({
        importId: z.string(),
        accountData: z.object({
          name: z.string(),
          bankName: z.string(),
          accountType: z.enum(['SAVINGS', 'CHECKING', 'CREDIT_CARD']),
          accountNumber: z.string().optional(),
          initialBalance: z.number(),
        }),
        transactions: z.array(
          z.object({
            date: z.date(),
            amount: z.number(),
            description: z.string(),
            rawDescription: z.string(),
            type: z.enum(['EXPENSE', 'INCOME']),
            categoryId: z.string().optional(),
          }),
        ),
        reconciliationMethod: z.enum(['OVERRIDE', 'AI_FIND', 'MANUAL']).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Create bank account
      const account = await ctx.db.bankAccount.create({
        data: {
          userId: ctx.session.user.id,
          name: input.accountData.name,
          bankName: input.accountData.bankName,
          accountType: input.accountData.accountType,
          accountNumber: input.accountData.accountNumber,
          initialBalance: input.accountData.initialBalance,
          currentBalance: input.accountData.initialBalance,
          importSource: 'CSV', // TODO: Get from import record
          lastImportDate: new Date(),
        },
      });

      // Bulk create transactions
      await ctx.db.transaction.createMany({
        data: input.transactions.map((tx) => ({
          userId: ctx.session.user.id,
          accountId: account.id,
          importId: input.importId,
          amount: tx.amount,
          description: tx.description,
          rawDescription: tx.rawDescription,
          date: tx.date,
          type: tx.type,
          categoryId: tx.categoryId,
        })),
      });

      // Calculate final balance
      const totalAmount = input.transactions.reduce((sum, tx) => sum + tx.amount, 0);
      const finalBalance = input.accountData.initialBalance + totalAmount;

      // Update account balance
      await ctx.db.bankAccount.update({
        where: { id: account.id },
        data: { currentBalance: finalBalance },
      });

      // Update import record
      await ctx.db.dataImport.update({
        where: { id: input.importId },
        data: {
          accountId: account.id,
          calculatedBalance: finalBalance,
          reconciliationMethod: input.reconciliationMethod,
        },
      });

      // Create follow-up task
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      await ctx.db.task.create({
        data: {
          userId: ctx.session.user.id,
          title: `Importar transacciones de ${input.accountData.name}`,
          description: `Recordatorio para actualizar tu cuenta ${input.accountData.name}`,
          dueDate: nextMonth,
          type: 'IMPORT_REMINDER',
          metadata: {
            accountId: account.id,
            bankName: input.accountData.bankName,
          },
        },
      });

      return {
        accountId: account.id,
        transactionsCreated: input.transactions.length,
        finalBalance,
      };
    }),

  /**
   * Auto-categorize transactions with AI
   * Uses GPT-4 to suggest categories
   */
  categorize: protectedProcedure
    .input(
      z.object({
        transactions: z.array(
          z.object({
            description: z.string(),
            amount: z.number(),
            type: z.enum(['EXPENSE', 'INCOME']),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Fetch available categories
        const categories = await ctx.db.category.findMany({
          where: {
            OR: [{ userId: null }, { userId: ctx.session.user.id }],
          },
          select: {
            id: true,
            key: true,
            name: true,
            type: true,
          },
        });

        // Call AI categorization
        const results = await categorizeTransactions(
          input.transactions,
          categories.map((cat) => ({
            key: cat.key,
            name: cat.name,
            type: cat.type as 'EXPENSE' | 'INCOME',
          })),
        );

        // Map categoryKey to categoryId
        return results.map((result) => {
          const category = categories.find((cat) => cat.key === result.categoryKey);
          return {
            index: result.index,
            categoryId: category?.id,
            categoryKey: result.categoryKey,
            confidence: result.confidence,
          };
        });
      } catch (error) {
        console.error('Categorization error:', error);
        throw error;
      }
    }),

  /**
   * Append transactions to existing account (re-import)
   * Detects and skips duplicates
   */
  appendToAccount: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        importId: z.string(),
        transactions: z.array(
          z.object({
            date: z.date(),
            amount: z.number(),
            description: z.string(),
            rawDescription: z.string(),
            type: z.enum(['EXPENSE', 'INCOME']),
            categoryId: z.string().optional(),
          }),
        ),
        skipDuplicates: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify account exists and belongs to user
      const account = await ctx.db.bankAccount.findFirst({
        where: {
          id: input.accountId,
          userId: ctx.session.user.id,
        },
      });

      if (!account) {
        throw new Error('Cuenta no encontrada');
      }

      // Fetch existing transactions for duplicate detection
      const existingTransactions = await ctx.db.transaction.findMany({
        where: { accountId: input.accountId },
        select: { date: true, amount: true, description: true },
      });

      // Detect duplicates
      const { duplicates } = findDuplicates(
        input.transactions.map((tx) => ({
          date: tx.date,
          amount: tx.amount,
          description: tx.description,
        })),
        existingTransactions,
      );

      // Filter transactions to import
      const transactionsToImport = input.skipDuplicates
        ? input.transactions.filter((tx) => {
            const isDupe = duplicates.some(
              (dup) =>
                dup.date.getTime() === tx.date.getTime() &&
                dup.amount === tx.amount &&
                dup.description === tx.description,
            );
            return !isDupe;
          })
        : input.transactions;

      if (transactionsToImport.length > 0) {
        // Bulk insert new transactions
        await ctx.db.transaction.createMany({
          data: transactionsToImport.map((tx) => ({
            userId: ctx.session.user.id,
            accountId: input.accountId,
            importId: input.importId,
            amount: tx.amount,
            description: tx.description,
            rawDescription: tx.rawDescription,
            date: tx.date,
            type: tx.type,
            categoryId: tx.categoryId,
          })),
        });

        // Update account balance
        const totalAmount = transactionsToImport.reduce((sum, tx) => sum + tx.amount, 0);
        await ctx.db.bankAccount.update({
          where: { id: input.accountId },
          data: {
            currentBalance: { increment: totalAmount },
            lastImportDate: new Date(),
          },
        });
      }

      // Update import record
      await ctx.db.dataImport.update({
        where: { id: input.importId },
        data: {
          accountId: input.accountId,
        },
      });

      return {
        transactionsAdded: transactionsToImport.length,
        duplicatesSkipped: duplicates.length,
        totalProcessed: input.transactions.length,
      };
    }),

  /**
   * Suggest missing transactions using AI
   * Helps reconcile balance discrepancies
   */
  suggestMissingTransactions: protectedProcedure
    .input(
      z.object({
        importId: z.string(),
        reportedBalance: z.number(),
        calculatedBalance: z.number(),
        transactions: z.array(
          z.object({
            description: z.string(),
            amount: z.number(),
            type: z.enum(['EXPENSE', 'INCOME']),
            date: z.date().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const suggestions = await suggestMissingTransactions({
          reportedBalance: input.reportedBalance,
          calculatedBalance: input.calculatedBalance,
          transactions: input.transactions,
        });

        return {
          suggestions,
          count: suggestions.length,
        };
      } catch (error) {
        console.error('Error suggesting missing transactions:', error);
        throw error;
      }
    }),
});
