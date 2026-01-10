/**
 * Import Router Integration Tests
 * Tests tRPC endpoints with database integration
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { appRouter } from '@/shared/lib/trpc/root';
import type { Session } from 'next-auth';
import { db } from '@/shared/lib/db';

// Mock external dependencies
vi.mock('@/shared/lib/bank-parser', () => ({
  parseBankCSV: vi.fn(),
}));

vi.mock('@/features/import/utils/pdf-ocr', () => ({
  parseBankPDF: vi.fn(),
}));

vi.mock('@/features/import/utils/ai-categorization', () => ({
  categorizeTransactions: vi.fn(),
}));

vi.mock('@/features/import/utils/ai-reconciliation', () => ({
  suggestMissingTransactions: vi.fn(),
}));

// Import mocked functions for assertions
import { parseBankCSV } from '@/shared/lib/bank-parser';
import { parseBankPDF } from '@/features/import/utils/pdf-ocr';
import { categorizeTransactions } from '@/features/import/utils/ai-categorization';
import { suggestMissingTransactions } from '@/features/import/utils/ai-reconciliation';

// Test data
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  preferredName: 'TestUser',
  role: 'USER',
};

const mockSession: Session = {
  user: mockUser,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Helper to create tRPC caller with session
function createCaller(session: Session = mockSession) {
  return appRouter.createCaller({
    session,
    db,
  });
}

// Helper to clean up test data
async function cleanupTestData() {
  // Delete in order to respect foreign key constraints
  await db.task.deleteMany({ where: { userId: mockUser.id } });
  await db.transaction.deleteMany({ where: { userId: mockUser.id } });
  await db.dataImport.deleteMany({ where: { userId: mockUser.id } });
  await db.bankAccount.deleteMany({ where: { userId: mockUser.id } });
}

describe('Import Router Integration Tests', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await cleanupTestData();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('parseCSV', () => {
    it('should parse valid Bancolombia CSV and create import record', async () => {
      const mockParseResult = {
        account: {
          bankName: 'Bancolombia',
          accountType: 'SAVINGS' as const,
          accountNumber: '1234567890',
          reportedBalance: 500000,
          suggestedName: 'Ahorros Bancolombia',
        },
        transactions: [
          {
            date: new Date('2024-01-15'),
            amount: -50000,
            description: 'Compra en Exito',
            rawDescription: 'COMPRA EN EXITO CALLE 100',
            type: 'EXPENSE' as const,
          },
          {
            date: new Date('2024-01-10'),
            amount: 1000000,
            description: 'Salario',
            rawDescription: 'ABONO NOMINA EMPRESA XYZ',
            type: 'INCOME' as const,
          },
        ],
        confidence: 0.95,
      };

      vi.mocked(parseBankCSV).mockResolvedValue(mockParseResult);

      const caller = createCaller();
      const csvContent = Buffer.from('fake,csv,data', 'utf-8').toString('base64');

      const result = await caller.import.parseCSV({
        fileName: 'estado_bancolombia.csv',
        fileContent: csvContent,
      });

      // Verify result structure
      expect(result.importId).toBeDefined();
      expect(result.account.bankName).toBe('Bancolombia');
      expect(result.account.accountType).toBe('SAVINGS');
      expect(result.transactions).toHaveLength(2);
      expect(result.confidence).toBe(0.95);

      // Verify import record was created in database
      const importRecord = await db.dataImport.findUnique({
        where: { id: result.importId },
      });

      expect(importRecord).toBeDefined();
      expect(importRecord?.status).toBe('COMPLETED');
      expect(importRecord?.detectedBank).toBe('Bancolombia');
      expect(importRecord?.transactionsFound).toBe(2);
      expect(importRecord?.reportedBalance).toBe(500000);
      expect(importRecord?.fileType).toBe('CSV');
    });

    it('should create failed import record on parse error', async () => {
      vi.mocked(parseBankCSV).mockRejectedValue(new Error('Invalid CSV format'));

      const caller = createCaller();
      const csvContent = Buffer.from('invalid,data', 'utf-8').toString('base64');

      await expect(
        caller.import.parseCSV({
          fileName: 'invalid.csv',
          fileContent: csvContent,
        }),
      ).rejects.toThrow('Invalid CSV format');

      // Verify failed import record was created
      const failedImports = await db.dataImport.findMany({
        where: {
          userId: mockUser.id,
          status: 'FAILED',
        },
      });

      expect(failedImports).toHaveLength(1);
      expect(failedImports[0].errorMessage).toBe('Invalid CSV format');
      expect(failedImports[0].fileType).toBe('CSV');
    });

    it('should handle undetected bank format', async () => {
      vi.mocked(parseBankCSV).mockResolvedValue(null);

      const caller = createCaller();
      const csvContent = Buffer.from('unknown,format', 'utf-8').toString('base64');

      await expect(
        caller.import.parseCSV({
          fileName: 'unknown.csv',
          fileContent: csvContent,
        }),
      ).rejects.toThrow('No se pudo detectar el formato del banco');
    });

    it('should decode base64 content correctly', async () => {
      const csvText = 'FECHA,DESCRIPCIÓN,DÉBITOS,CRÉDITOS\n01/01/2024,Test,1000,';
      const base64 = Buffer.from(csvText, 'utf-8').toString('base64');

      vi.mocked(parseBankCSV).mockImplementation((text) => {
        // Verify the text was decoded correctly
        expect(text).toBe(csvText);
        return Promise.resolve({
          account: {
            bankName: 'Bancolombia',
            accountType: 'SAVINGS',
            reportedBalance: 0,
            suggestedName: 'Ahorros Bancolombia',
          },
          transactions: [],
          confidence: 0.9,
        });
      });

      const caller = createCaller();
      await caller.import.parseCSV({
        fileName: 'test.csv',
        fileContent: base64,
      });

      expect(parseBankCSV).toHaveBeenCalledWith(csvText);
    });
  });

  describe('parsePDF', () => {
    it('should parse valid PDF and create import record', async () => {
      const mockParseResult = {
        account: {
          bankName: 'Bancolombia',
          accountType: 'SAVINGS' as const,
          reportedBalance: 750000,
          suggestedName: 'Ahorros Bancolombia',
        },
        transactions: [
          {
            date: new Date('2024-01-20'),
            amount: -30000,
            description: 'Compra farmacia',
            rawDescription: 'FARMACIA LA REBAJA',
            type: 'EXPENSE' as const,
          },
        ],
        confidence: 0.85,
      };

      vi.mocked(parseBankPDF).mockResolvedValue(mockParseResult);

      const caller = createCaller();
      const pdfContent = Buffer.from('fake-pdf-data').toString('base64');

      const result = await caller.import.parsePDF({
        fileName: 'estado.pdf',
        fileContent: pdfContent,
      });

      expect(result.importId).toBeDefined();
      expect(result.account.bankName).toBe('Bancolombia');
      expect(result.transactions).toHaveLength(1);

      // Verify import record
      const importRecord = await db.dataImport.findUnique({
        where: { id: result.importId },
      });

      expect(importRecord?.fileType).toBe('PDF');
      expect(importRecord?.status).toBe('COMPLETED');
    });

    it('should create failed import record on PDF parse error', async () => {
      vi.mocked(parseBankPDF).mockRejectedValue(new Error('OCR failed: corrupted PDF'));

      const caller = createCaller();
      const pdfContent = Buffer.from('corrupted').toString('base64');

      await expect(
        caller.import.parsePDF({
          fileName: 'corrupted.pdf',
          fileContent: pdfContent,
        }),
      ).rejects.toThrow('OCR failed');

      const failedImports = await db.dataImport.findMany({
        where: {
          userId: mockUser.id,
          status: 'FAILED',
          fileType: 'PDF',
        },
      });

      expect(failedImports).toHaveLength(1);
    });
  });

  describe('confirmImport', () => {
    it('should create account and transactions successfully', async () => {
      // First create an import record
      const importRecord = await db.dataImport.create({
        data: {
          userId: mockUser.id,
          fileName: 'test.csv',
          fileType: 'CSV',
          status: 'COMPLETED',
          detectedBank: 'Bancolombia',
          transactionsFound: 2,
        },
      });

      const caller = createCaller();

      const result = await caller.import.confirmImport({
        importId: importRecord.id,
        accountData: {
          name: 'Ahorros Bancolombia',
          bankName: 'Bancolombia',
          accountType: 'SAVINGS',
          accountNumber: '1234567890',
          initialBalance: 100000,
        },
        transactions: [
          {
            date: new Date('2024-01-15'),
            amount: -50000,
            description: 'Compra Exito',
            rawDescription: 'COMPRA EN EXITO',
            type: 'EXPENSE',
          },
          {
            date: new Date('2024-01-20'),
            amount: 200000,
            description: 'Transferencia',
            rawDescription: 'TRANSFERENCIA RECIBIDA',
            type: 'INCOME',
          },
        ],
        reconciliationMethod: 'OVERRIDE',
      });

      // Verify result
      expect(result.accountId).toBeDefined();
      expect(result.transactionsCreated).toBe(2);
      expect(result.finalBalance).toBe(250000); // 100,000 - 50,000 + 200,000

      // Verify account created
      const account = await db.bankAccount.findUnique({
        where: { id: result.accountId },
      });

      expect(account).toBeDefined();
      expect(account?.name).toBe('Ahorros Bancolombia');
      expect(account?.bankName).toBe('Bancolombia');
      expect(account?.accountType).toBe('SAVINGS');
      expect(account?.initialBalance).toBe(100000);
      expect(account?.currentBalance).toBe(250000);

      // Verify transactions created
      const transactions = await db.transaction.findMany({
        where: { accountId: result.accountId },
      });

      expect(transactions).toHaveLength(2);
      expect(transactions[0].amount).toBe(-50000);
      expect(transactions[1].amount).toBe(200000);

      // Verify import record updated
      const updatedImport = await db.dataImport.findUnique({
        where: { id: importRecord.id },
      });

      expect(updatedImport?.accountId).toBe(result.accountId);
      expect(updatedImport?.calculatedBalance).toBe(250000);
      expect(updatedImport?.reconciliationMethod).toBe('OVERRIDE');

      // Verify follow-up task created
      const tasks = await db.task.findMany({
        where: {
          userId: mockUser.id,
          type: 'IMPORT_REMINDER',
        },
      });

      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toContain('Ahorros Bancolombia');
    });

    it('should handle transactions with categories', async () => {
      // Create a category first
      const category = await db.category.create({
        data: {
          key: 'groceries',
          name: 'Mercado',
          type: 'EXPENSE',
          icon: '🛒',
          color: '#4CAF50',
          userId: null, // Global category
        },
      });

      const importRecord = await db.dataImport.create({
        data: {
          userId: mockUser.id,
          fileName: 'test.csv',
          fileType: 'CSV',
          status: 'COMPLETED',
          detectedBank: 'Bancolombia',
          transactionsFound: 1,
        },
      });

      const caller = createCaller();

      const result = await caller.import.confirmImport({
        importId: importRecord.id,
        accountData: {
          name: 'Test Account',
          bankName: 'Bancolombia',
          accountType: 'SAVINGS',
          initialBalance: 0,
        },
        transactions: [
          {
            date: new Date('2024-01-15'),
            amount: -50000,
            description: 'Compra Exito',
            rawDescription: 'EXITO',
            type: 'EXPENSE',
            categoryId: category.id,
          },
        ],
      });

      // Verify transaction has category
      const transaction = await db.transaction.findFirst({
        where: { accountId: result.accountId },
      });

      expect(transaction?.categoryId).toBe(category.id);

      // Cleanup category
      await db.category.delete({ where: { id: category.id } });
    });

    it('should calculate final balance correctly with multiple transactions', async () => {
      const importRecord = await db.dataImport.create({
        data: {
          userId: mockUser.id,
          fileName: 'test.csv',
          fileType: 'CSV',
          status: 'COMPLETED',
          detectedBank: 'Bancolombia',
          transactionsFound: 5,
        },
      });

      const caller = createCaller();

      const result = await caller.import.confirmImport({
        importId: importRecord.id,
        accountData: {
          name: 'Test Account',
          bankName: 'Bancolombia',
          accountType: 'CHECKING',
          initialBalance: 500000,
        },
        transactions: [
          {
            date: new Date(),
            amount: -100000,
            description: 'Test 1',
            rawDescription: 'Test 1',
            type: 'EXPENSE',
          },
          {
            date: new Date(),
            amount: -50000,
            description: 'Test 2',
            rawDescription: 'Test 2',
            type: 'EXPENSE',
          },
          {
            date: new Date(),
            amount: 200000,
            description: 'Test 3',
            rawDescription: 'Test 3',
            type: 'INCOME',
          },
          {
            date: new Date(),
            amount: -30000,
            description: 'Test 4',
            rawDescription: 'Test 4',
            type: 'EXPENSE',
          },
          {
            date: new Date(),
            amount: 100000,
            description: 'Test 5',
            rawDescription: 'Test 5',
            type: 'INCOME',
          },
        ],
      });

      // Initial: 500,000
      // -100,000 - 50,000 + 200,000 - 30,000 + 100,000 = +120,000
      // Final: 620,000
      expect(result.finalBalance).toBe(620000);

      const account = await db.bankAccount.findUnique({
        where: { id: result.accountId },
      });

      expect(account?.currentBalance).toBe(620000);
    });
  });

  describe('categorize', () => {
    beforeEach(async () => {
      // Create test categories
      await db.category.createMany({
        data: [
          {
            key: 'groceries',
            name: 'Mercado',
            type: 'EXPENSE',
            icon: '🛒',
            color: '#4CAF50',
            userId: null,
          },
          {
            key: 'transport',
            name: 'Transporte',
            type: 'EXPENSE',
            icon: '🚗',
            color: '#2196F3',
            userId: null,
          },
          {
            key: 'salary',
            name: 'Salario',
            type: 'INCOME',
            icon: '💰',
            color: '#4CAF50',
            userId: null,
          },
        ],
      });
    });

    afterEach(async () => {
      await db.category.deleteMany({ where: { userId: null } });
    });

    it('should categorize transactions with AI', async () => {
      const mockCategorizationResult = [
        { index: 0, categoryKey: 'groceries', confidence: 0.9 },
        { index: 1, categoryKey: 'transport', confidence: 0.85 },
      ];

      vi.mocked(categorizeTransactions).mockResolvedValue(mockCategorizationResult);

      const caller = createCaller();

      const result = await caller.import.categorize({
        transactions: [
          { description: 'Compra en Exito', amount: -50000, type: 'EXPENSE' },
          { description: 'Uber', amount: -15000, type: 'EXPENSE' },
        ],
      });

      expect(result).toHaveLength(2);
      expect(result[0].categoryKey).toBe('groceries');
      expect(result[0].confidence).toBe(0.9);
      expect(result[0].categoryId).toBeDefined();

      expect(result[1].categoryKey).toBe('transport');
      expect(result[1].confidence).toBe(0.85);

      // Verify AI categorization was called with categories
      expect(categorizeTransactions).toHaveBeenCalledWith(
        expect.arrayContaining([
          { description: 'Compra en Exito', amount: -50000, type: 'EXPENSE' },
        ]),
        expect.arrayContaining([
          { key: 'groceries', name: 'Mercado', type: 'EXPENSE' },
          { key: 'transport', name: 'Transporte', type: 'EXPENSE' },
        ]),
      );
    });

    it('should handle categorization errors', async () => {
      vi.mocked(categorizeTransactions).mockRejectedValue(new Error('OpenAI API error'));

      const caller = createCaller();

      await expect(
        caller.import.categorize({
          transactions: [{ description: 'Test', amount: -10000, type: 'EXPENSE' }],
        }),
      ).rejects.toThrow('OpenAI API error');
    });
  });

  describe('appendToAccount', () => {
    it('should append new transactions to existing account', async () => {
      // Create existing account with transactions
      const account = await db.bankAccount.create({
        data: {
          userId: mockUser.id,
          name: 'Existing Account',
          bankName: 'Bancolombia',
          accountType: 'SAVINGS',
          initialBalance: 100000,
          currentBalance: 100000,
        },
      });

      await db.transaction.create({
        data: {
          userId: mockUser.id,
          accountId: account.id,
          date: new Date('2024-01-15'),
          amount: -50000,
          description: 'Old transaction',
          rawDescription: 'OLD TRANSACTION',
          type: 'EXPENSE',
        },
      });

      // Create import record
      const importRecord = await db.dataImport.create({
        data: {
          userId: mockUser.id,
          fileName: 'february.csv',
          fileType: 'CSV',
          status: 'COMPLETED',
          detectedBank: 'Bancolombia',
          transactionsFound: 2,
        },
      });

      const caller = createCaller();

      const result = await caller.import.appendToAccount({
        accountId: account.id,
        importId: importRecord.id,
        transactions: [
          {
            date: new Date('2024-02-01'),
            amount: -30000,
            description: 'New transaction 1',
            rawDescription: 'NEW TX 1',
            type: 'EXPENSE',
          },
          {
            date: new Date('2024-02-05'),
            amount: 100000,
            description: 'New transaction 2',
            rawDescription: 'NEW TX 2',
            type: 'INCOME',
          },
        ],
        skipDuplicates: true,
      });

      expect(result.transactionsAdded).toBe(2);
      expect(result.duplicatesSkipped).toBe(0);
      expect(result.totalProcessed).toBe(2);

      // Verify transactions were added
      const allTransactions = await db.transaction.findMany({
        where: { accountId: account.id },
        orderBy: { date: 'asc' },
      });

      expect(allTransactions).toHaveLength(3); // 1 old + 2 new

      // Verify balance updated
      const updatedAccount = await db.bankAccount.findUnique({
        where: { id: account.id },
      });

      expect(updatedAccount?.currentBalance).toBe(170000); // 100,000 - 30,000 + 100,000
    });

    it('should skip duplicate transactions', async () => {
      // Create existing account with transaction
      const account = await db.bankAccount.create({
        data: {
          userId: mockUser.id,
          name: 'Test Account',
          bankName: 'Bancolombia',
          accountType: 'SAVINGS',
          initialBalance: 0,
          currentBalance: -50000,
        },
      });

      await db.transaction.create({
        data: {
          userId: mockUser.id,
          accountId: account.id,
          date: new Date('2024-01-15'),
          amount: -50000,
          description: 'Compra en Exito',
          rawDescription: 'COMPRA EN EXITO',
          type: 'EXPENSE',
        },
      });

      const importRecord = await db.dataImport.create({
        data: {
          userId: mockUser.id,
          fileName: 're-import.csv',
          fileType: 'CSV',
          status: 'COMPLETED',
          detectedBank: 'Bancolombia',
          transactionsFound: 2,
        },
      });

      const caller = createCaller();

      const result = await caller.import.appendToAccount({
        accountId: account.id,
        importId: importRecord.id,
        transactions: [
          {
            // Duplicate (same date, amount, description)
            date: new Date('2024-01-15'),
            amount: -50000,
            description: 'Compra en Exito',
            rawDescription: 'COMPRA EN EXITO',
            type: 'EXPENSE',
          },
          {
            // New transaction
            date: new Date('2024-01-20'),
            amount: -30000,
            description: 'Nueva compra',
            rawDescription: 'NUEVA COMPRA',
            type: 'EXPENSE',
          },
        ],
        skipDuplicates: true,
      });

      expect(result.transactionsAdded).toBe(1); // Only the new one
      expect(result.duplicatesSkipped).toBe(1);

      // Verify only 2 transactions total (1 old + 1 new)
      const transactions = await db.transaction.findMany({
        where: { accountId: account.id },
      });

      expect(transactions).toHaveLength(2);
    });

    it('should throw error if account not found', async () => {
      const importRecord = await db.dataImport.create({
        data: {
          userId: mockUser.id,
          fileName: 'test.csv',
          fileType: 'CSV',
          status: 'COMPLETED',
          detectedBank: 'Bancolombia',
          transactionsFound: 1,
        },
      });

      const caller = createCaller();

      await expect(
        caller.import.appendToAccount({
          accountId: 'non-existent-account-id',
          importId: importRecord.id,
          transactions: [
            {
              date: new Date(),
              amount: -10000,
              description: 'Test',
              rawDescription: 'TEST',
              type: 'EXPENSE',
            },
          ],
          skipDuplicates: true,
        }),
      ).rejects.toThrow('Cuenta no encontrada');
    });

    it('should not skip duplicates if skipDuplicates is false', async () => {
      const account = await db.bankAccount.create({
        data: {
          userId: mockUser.id,
          name: 'Test Account',
          bankName: 'Bancolombia',
          accountType: 'SAVINGS',
          initialBalance: 0,
          currentBalance: -50000,
        },
      });

      await db.transaction.create({
        data: {
          userId: mockUser.id,
          accountId: account.id,
          date: new Date('2024-01-15'),
          amount: -50000,
          description: 'Compra',
          rawDescription: 'COMPRA',
          type: 'EXPENSE',
        },
      });

      const importRecord = await db.dataImport.create({
        data: {
          userId: mockUser.id,
          fileName: 'test.csv',
          fileType: 'CSV',
          status: 'COMPLETED',
          detectedBank: 'Bancolombia',
          transactionsFound: 1,
        },
      });

      const caller = createCaller();

      const result = await caller.import.appendToAccount({
        accountId: account.id,
        importId: importRecord.id,
        transactions: [
          {
            date: new Date('2024-01-15'),
            amount: -50000,
            description: 'Compra',
            rawDescription: 'COMPRA',
            type: 'EXPENSE',
          },
        ],
        skipDuplicates: false, // Don't skip
      });

      // Should add the duplicate
      expect(result.transactionsAdded).toBe(1);

      const transactions = await db.transaction.findMany({
        where: { accountId: account.id },
      });

      expect(transactions).toHaveLength(2); // Both transactions
    });
  });

  describe('suggestMissingTransactions', () => {
    it('should return AI suggestions for missing transactions', async () => {
      const mockSuggestions = [
        {
          date: '2024-01-31',
          description: 'Cuota de manejo',
          amount: -15000,
          type: 'EXPENSE' as const,
          confidence: 0.9,
          reasoning: 'Cargo mensual típico',
        },
        {
          date: '2024-01-20',
          description: 'GMF 4x1000',
          amount: -4000,
          type: 'EXPENSE' as const,
          confidence: 0.85,
          reasoning: 'Impuesto sobre retiros',
        },
      ];

      vi.mocked(suggestMissingTransactions).mockResolvedValue(mockSuggestions);

      // Create import record
      const importRecord = await db.dataImport.create({
        data: {
          userId: mockUser.id,
          fileName: 'test.csv',
          fileType: 'CSV',
          status: 'COMPLETED',
          detectedBank: 'Bancolombia',
          transactionsFound: 5,
        },
      });

      const caller = createCaller();

      const result = await caller.import.suggestMissingTransactions({
        importId: importRecord.id,
        reportedBalance: 500000,
        calculatedBalance: 519000, // $19,000 difference
        transactions: [
          { description: 'Compra', amount: -50000, type: 'EXPENSE' },
          { description: 'Salario', amount: 1000000, type: 'INCOME' },
        ],
      });

      expect(result.suggestions).toHaveLength(2);
      expect(result.count).toBe(2);
      expect(result.suggestions[0].description).toBe('Cuota de manejo');
      expect(result.suggestions[1].description).toBe('GMF 4x1000');

      // Verify AI was called correctly
      expect(suggestMissingTransactions).toHaveBeenCalledWith({
        reportedBalance: 500000,
        calculatedBalance: 519000,
        transactions: expect.arrayContaining([
          { description: 'Compra', amount: -50000, type: 'EXPENSE' },
        ]),
      });
    });

    it('should handle AI errors gracefully', async () => {
      vi.mocked(suggestMissingTransactions).mockRejectedValue(new Error('OpenAI quota exceeded'));

      const importRecord = await db.dataImport.create({
        data: {
          userId: mockUser.id,
          fileName: 'test.csv',
          fileType: 'CSV',
          status: 'COMPLETED',
          detectedBank: 'Bancolombia',
          transactionsFound: 1,
        },
      });

      const caller = createCaller();

      await expect(
        caller.import.suggestMissingTransactions({
          importId: importRecord.id,
          reportedBalance: 100000,
          calculatedBalance: 115000,
          transactions: [],
        }),
      ).rejects.toThrow('OpenAI quota exceeded');
    });
  });
});
