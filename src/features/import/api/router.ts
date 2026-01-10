/**
 * Import Router
 * Handles bank statement parsing (CSV/PDF) and import confirmation
 */
import { z } from 'zod';
import { router, protectedProcedure } from '@/shared/lib/trpc/init';
import { parseBankCSV } from '@/shared/lib/bank-parser';

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
   */
  parsePDF: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileContent: z.string(), // base64 encoded
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Import and use parseBankPDF when implemented
        // const result = await parseBankPDF(input.fileContent);

        // Placeholder for now
        throw new Error('PDF parsing not yet implemented');

        // const importRecord = await ctx.db.dataImport.create({
        //   data: {
        //     userId: ctx.session.user.id,
        //     fileName: input.fileName,
        //     fileType: 'PDF',
        //     status: 'COMPLETED',
        //     detectedBank: result.account.bankName,
        //     reportedBalance: result.account.reportedBalance,
        //     transactionsFound: result.transactions.length,
        //   },
        // });

        // return {
        //   importId: importRecord.id,
        //   account: result.account,
        //   transactions: result.transactions,
        //   confidence: result.confidence,
        // };
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
});
