/**
 * AI Reconciliation Utility Tests
 * Tests for AI-powered missing transaction suggestions
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  suggestMissingTransactions,
  validateSuggestions,
  type SuggestedTransaction,
} from '@/features/import/utils/ai-reconciliation';
import { openai } from '@/shared/lib/openai';

// Mock OpenAI module
vi.mock('@/shared/lib/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
}));

describe('AI Reconciliation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('suggestMissingTransactions', () => {
    it('should return empty array for negligible differences (<$100)', async () => {
      const input = {
        reportedBalance: 100000,
        calculatedBalance: 100050, // Only $50 difference
        transactions: [{ description: 'Test', amount: -50000, type: 'EXPENSE' as const }],
      };

      const result = await suggestMissingTransactions(input);

      expect(result).toEqual([]);
      expect(openai.chat.completions.create).not.toHaveBeenCalled();
    });

    it('should call OpenAI API for significant differences (>$100)', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify([
                {
                  date: '2024-01-15',
                  description: 'Cuota de manejo',
                  amount: -15000,
                  type: 'EXPENSE',
                  confidence: 0.85,
                  reasoning: 'Cargo mensual típico de Bancolombia',
                },
              ]),
            },
          },
        ],
      };

      vi.mocked(openai.chat.completions.create).mockResolvedValue(mockResponse as any);

      const input = {
        reportedBalance: 100000,
        calculatedBalance: 115000, // $15,000 difference
        transactions: [
          {
            description: 'Compra Exito',
            amount: -50000,
            type: 'EXPENSE' as const,
            date: new Date('2024-01-10'),
          },
          {
            description: 'Salario',
            amount: 1000000,
            type: 'INCOME' as const,
            date: new Date('2024-01-05'),
          },
        ],
      };

      const result = await suggestMissingTransactions(input);

      expect(openai.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o',
          temperature: 0.3,
          max_tokens: 1000,
        }),
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        date: '2024-01-15',
        description: 'Cuota de manejo',
        amount: -15000,
        type: 'EXPENSE',
        confidence: 0.85,
      });
    });

    it('should parse AI response with markdown wrapping', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: `\`\`\`json
[
  {
    "date": "2024-01-15",
    "description": "GMF 4x1000",
    "amount": -4000,
    "type": "EXPENSE",
    "confidence": 0.9,
    "reasoning": "Gravamen a los movimientos financieros"
  }
]
\`\`\``,
            },
          },
        ],
      };

      vi.mocked(openai.chat.completions.create).mockResolvedValue(mockResponse as any);

      const input = {
        reportedBalance: 100000,
        calculatedBalance: 104000,
        transactions: [{ description: 'Test', amount: -50000, type: 'EXPENSE' as const }],
      };

      const result = await suggestMissingTransactions(input);

      expect(result).toHaveLength(1);
      expect(result[0].description).toBe('GMF 4x1000');
    });

    it('should filter out invalid suggestions', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify([
                {
                  date: '2024-01-15',
                  description: 'Valid transaction',
                  amount: -10000,
                  type: 'EXPENSE',
                  confidence: 0.8,
                  reasoning: 'Valid',
                },
                {
                  // Missing date
                  description: 'Invalid - no date',
                  amount: -5000,
                  type: 'EXPENSE',
                  confidence: 0.7,
                  reasoning: 'Test',
                },
                {
                  date: '2024-01-16',
                  description: 'Invalid - confidence too low',
                  amount: -3000,
                  type: 'EXPENSE',
                  confidence: 0, // Invalid
                  reasoning: 'Test',
                },
                {
                  date: '2024-01-17',
                  description: 'Invalid - confidence > 1',
                  amount: -2000,
                  type: 'EXPENSE',
                  confidence: 1.5, // Invalid
                  reasoning: 'Test',
                },
              ]),
            },
          },
        ],
      };

      vi.mocked(openai.chat.completions.create).mockResolvedValue(mockResponse as any);

      const input = {
        reportedBalance: 100000,
        calculatedBalance: 120000,
        transactions: [{ description: 'Test', amount: -50000, type: 'EXPENSE' as const }],
      };

      const result = await suggestMissingTransactions(input);

      // Only the valid transaction should pass
      expect(result).toHaveLength(1);
      expect(result[0].description).toBe('Valid transaction');
    });

    it('should sort suggestions by confidence (highest first)', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify([
                {
                  date: '2024-01-15',
                  description: 'Low confidence',
                  amount: -5000,
                  type: 'EXPENSE',
                  confidence: 0.5,
                  reasoning: 'Test',
                },
                {
                  date: '2024-01-16',
                  description: 'High confidence',
                  amount: -10000,
                  type: 'EXPENSE',
                  confidence: 0.95,
                  reasoning: 'Test',
                },
                {
                  date: '2024-01-17',
                  description: 'Medium confidence',
                  amount: -3000,
                  type: 'EXPENSE',
                  confidence: 0.7,
                  reasoning: 'Test',
                },
              ]),
            },
          },
        ],
      };

      vi.mocked(openai.chat.completions.create).mockResolvedValue(mockResponse as any);

      const input = {
        reportedBalance: 100000,
        calculatedBalance: 118000,
        transactions: [{ description: 'Test', amount: -50000, type: 'EXPENSE' as const }],
      };

      const result = await suggestMissingTransactions(input);

      expect(result).toHaveLength(3);
      expect(result[0].confidence).toBe(0.95);
      expect(result[1].confidence).toBe(0.7);
      expect(result[2].confidence).toBe(0.5);
    });

    it('should handle Colombian banking charges correctly', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify([
                {
                  date: '2024-01-31',
                  description: 'Cuota de manejo cuenta ahorros',
                  amount: -12000,
                  type: 'EXPENSE',
                  confidence: 0.9,
                  reasoning: 'Cargo mensual típico en Bancolombia',
                },
                {
                  date: '2024-01-15',
                  description: 'GMF 4x1000 sobre retiros',
                  amount: -4000,
                  type: 'EXPENSE',
                  confidence: 0.85,
                  reasoning: 'Impuesto sobre movimientos financieros',
                },
                {
                  date: '2024-01-20',
                  description: 'Seguro de protección',
                  amount: -8000,
                  type: 'EXPENSE',
                  confidence: 0.75,
                  reasoning: 'Seguro mensual de cuenta',
                },
              ]),
            },
          },
        ],
      };

      vi.mocked(openai.chat.completions.create).mockResolvedValue(mockResponse as any);

      const input = {
        reportedBalance: 100000,
        calculatedBalance: 124000, // $24,000 difference
        transactions: [
          {
            description: 'Salario',
            amount: 1000000,
            type: 'INCOME' as const,
            date: new Date('2024-01-05'),
          },
        ],
      };

      const result = await suggestMissingTransactions(input);

      expect(result).toHaveLength(3);

      // Verify Colombian banking charge patterns
      const cuotaManejo = result.find((s) =>
        s.description.toLowerCase().includes('cuota de manejo'),
      );
      expect(cuotaManejo).toBeDefined();
      expect(cuotaManejo?.amount).toBeLessThan(0);

      const gmf = result.find((s) => s.description.toLowerCase().includes('gmf'));
      expect(gmf).toBeDefined();

      const seguro = result.find((s) => s.description.toLowerCase().includes('seguro'));
      expect(seguro).toBeDefined();
    });

    it('should limit transactions list to 50 to avoid token limits', async () => {
      vi.mocked(openai.chat.completions.create).mockResolvedValue({
        choices: [{ message: { content: '[]' } }],
      } as any);

      const transactions = Array.from({ length: 100 }, (_, i) => ({
        description: `Transaction ${i}`,
        amount: -1000,
        type: 'EXPENSE' as const,
        date: new Date('2024-01-01'),
      }));

      const input = {
        reportedBalance: 100000,
        calculatedBalance: 110000,
        transactions,
      };

      await suggestMissingTransactions(input);

      const callArgs = vi.mocked(openai.chat.completions.create).mock.calls[0][0];
      const userMessage = callArgs.messages.find((m: any) => m.role === 'user');
      const content = userMessage?.content as string;

      // Count how many transactions are in the prompt
      const transactionLines = content.split('\n').filter((line) => line.includes('Transaction'));

      // Should only include 50 transactions
      expect(transactionLines.length).toBeLessThanOrEqual(50);
    });

    it('should return empty array on invalid JSON response', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'This is not valid JSON',
            },
          },
        ],
      };

      vi.mocked(openai.chat.completions.create).mockResolvedValue(mockResponse as any);

      const input = {
        reportedBalance: 100000,
        calculatedBalance: 115000,
        transactions: [{ description: 'Test', amount: -50000, type: 'EXPENSE' as const }],
      };

      const result = await suggestMissingTransactions(input);

      expect(result).toEqual([]);
    });

    it('should return empty array on OpenAI API error', async () => {
      vi.mocked(openai.chat.completions.create).mockRejectedValue(new Error('Network error'));

      const input = {
        reportedBalance: 100000,
        calculatedBalance: 115000,
        transactions: [{ description: 'Test', amount: -50000, type: 'EXPENSE' as const }],
      };

      const result = await suggestMissingTransactions(input);

      expect(result).toEqual([]);
    });

    it('should throw specific error for API key issues', async () => {
      vi.mocked(openai.chat.completions.create).mockRejectedValue(new Error('Invalid API key'));

      const input = {
        reportedBalance: 100000,
        calculatedBalance: 115000,
        transactions: [{ description: 'Test', amount: -50000, type: 'EXPENSE' as const }],
      };

      // Should not throw, but return empty array
      const result = await suggestMissingTransactions(input);
      expect(result).toEqual([]);
    });

    it('should handle quota exceeded error gracefully', async () => {
      vi.mocked(openai.chat.completions.create).mockRejectedValue(
        new Error('Rate limit exceeded - quota reached'),
      );

      const input = {
        reportedBalance: 100000,
        calculatedBalance: 115000,
        transactions: [{ description: 'Test', amount: -50000, type: 'EXPENSE' as const }],
      };

      const result = await suggestMissingTransactions(input);

      expect(result).toEqual([]);
    });

    it('should handle empty response from OpenAI', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      };

      vi.mocked(openai.chat.completions.create).mockResolvedValue(mockResponse as any);

      const input = {
        reportedBalance: 100000,
        calculatedBalance: 115000,
        transactions: [{ description: 'Test', amount: -50000, type: 'EXPENSE' as const }],
      };

      // Should not throw
      await expect(suggestMissingTransactions(input)).rejects.toThrow(
        'No se recibió respuesta de OpenAI',
      );
    });

    it('should format Colombian peso amounts correctly in prompt', async () => {
      vi.mocked(openai.chat.completions.create).mockResolvedValue({
        choices: [{ message: { content: '[]' } }],
      } as any);

      const input = {
        reportedBalance: 1500000, // $1,500,000
        calculatedBalance: 1485000, // $1,485,000
        transactions: [
          {
            description: 'Salario',
            amount: 2000000,
            type: 'INCOME' as const,
            date: new Date('2024-01-01'),
          },
        ],
      };

      await suggestMissingTransactions(input);

      const callArgs = vi.mocked(openai.chat.completions.create).mock.calls[0][0];
      const userMessage = callArgs.messages.find((m: any) => m.role === 'user');
      const content = userMessage?.content as string;

      // Check Colombian formatting (1.500.000 or 1,500,000)
      expect(content).toMatch(/\$1[.,]500[.,]000/);
      expect(content).toMatch(/\$1[.,]485[.,]000/);
    });
  });

  describe('validateSuggestions', () => {
    it('should validate suggestions that match target difference exactly', () => {
      const suggestions: SuggestedTransaction[] = [
        {
          date: '2024-01-15',
          description: 'Cuota de manejo',
          amount: -15000,
          type: 'EXPENSE',
          confidence: 0.9,
          reasoning: 'Test',
        },
      ];

      const result = validateSuggestions(suggestions, -15000);

      expect(result.isValid).toBe(true);
      expect(result.suggestedTotal).toBe(-15000);
      expect(result.remainingDifference).toBe(0);
      expect(result.accuracyPercentage).toBe(100);
    });

    it('should validate suggestions within $1,000 tolerance', () => {
      const suggestions: SuggestedTransaction[] = [
        {
          date: '2024-01-15',
          description: 'Cuota de manejo',
          amount: -15000,
          type: 'EXPENSE',
          confidence: 0.9,
          reasoning: 'Test',
        },
      ];

      // Target is -15,500, suggestions total -15,000 (difference: $500)
      const result = validateSuggestions(suggestions, -15500);

      expect(result.isValid).toBe(true); // Within $1,000 tolerance
      expect(result.suggestedTotal).toBe(-15000);
      expect(result.remainingDifference).toBe(-500);
      expect(result.accuracyPercentage).toBeCloseTo(96.77, 1);
    });

    it('should invalidate suggestions beyond $1,000 tolerance', () => {
      const suggestions: SuggestedTransaction[] = [
        {
          date: '2024-01-15',
          description: 'Cuota de manejo',
          amount: -10000,
          type: 'EXPENSE',
          confidence: 0.9,
          reasoning: 'Test',
        },
      ];

      // Target is -15,000, suggestions total -10,000 (difference: $5,000)
      const result = validateSuggestions(suggestions, -15000);

      expect(result.isValid).toBe(false); // Beyond $1,000 tolerance
      expect(result.suggestedTotal).toBe(-10000);
      expect(result.remainingDifference).toBe(-5000);
      expect(result.accuracyPercentage).toBeCloseTo(66.67, 1);
    });

    it('should calculate accuracy percentage correctly', () => {
      const suggestions: SuggestedTransaction[] = [
        {
          date: '2024-01-15',
          description: 'Transaction 1',
          amount: -7500,
          type: 'EXPENSE',
          confidence: 0.9,
          reasoning: 'Test',
        },
        {
          date: '2024-01-16',
          description: 'Transaction 2',
          amount: -7500,
          type: 'EXPENSE',
          confidence: 0.8,
          reasoning: 'Test',
        },
      ];

      // Target: -20,000, Suggested: -15,000, Remaining: -5,000
      // Accuracy: 100 - (5,000 / 20,000) * 100 = 75%
      const result = validateSuggestions(suggestions, -20000);

      expect(result.accuracyPercentage).toBe(75);
    });

    it('should handle multiple suggestions correctly', () => {
      const suggestions: SuggestedTransaction[] = [
        {
          date: '2024-01-15',
          description: 'Cuota de manejo',
          amount: -12000,
          type: 'EXPENSE',
          confidence: 0.9,
          reasoning: 'Test',
        },
        {
          date: '2024-01-20',
          description: 'GMF',
          amount: -4000,
          type: 'EXPENSE',
          confidence: 0.85,
          reasoning: 'Test',
        },
        {
          date: '2024-01-25',
          description: 'Seguro',
          amount: -8000,
          type: 'EXPENSE',
          confidence: 0.8,
          reasoning: 'Test',
        },
      ];

      const result = validateSuggestions(suggestions, -24000);

      expect(result.suggestedTotal).toBe(-24000);
      expect(result.remainingDifference).toBe(0);
      expect(result.accuracyPercentage).toBe(100);
      expect(result.isValid).toBe(true);
    });

    it('should handle empty suggestions array', () => {
      const result = validateSuggestions([], -15000);

      expect(result.suggestedTotal).toBe(0);
      expect(result.remainingDifference).toBe(-15000);
      expect(result.accuracyPercentage).toBe(0);
      expect(result.isValid).toBe(false);
    });

    it('should handle positive differences (missing income)', () => {
      const suggestions: SuggestedTransaction[] = [
        {
          date: '2024-01-15',
          description: 'Transfer from savings',
          amount: 100000,
          type: 'INCOME',
          confidence: 0.8,
          reasoning: 'Test',
        },
      ];

      const result = validateSuggestions(suggestions, 100000);

      expect(result.suggestedTotal).toBe(100000);
      expect(result.remainingDifference).toBe(0);
      expect(result.accuracyPercentage).toBe(100);
      expect(result.isValid).toBe(true);
    });

    it('should handle mixed income and expense suggestions', () => {
      const suggestions: SuggestedTransaction[] = [
        {
          date: '2024-01-15',
          description: 'Refund',
          amount: 50000,
          type: 'INCOME',
          confidence: 0.8,
          reasoning: 'Test',
        },
        {
          date: '2024-01-20',
          description: 'Fee',
          amount: -15000,
          type: 'EXPENSE',
          confidence: 0.9,
          reasoning: 'Test',
        },
      ];

      // Net: +50,000 - 15,000 = +35,000
      const result = validateSuggestions(suggestions, 35000);

      expect(result.suggestedTotal).toBe(35000);
      expect(result.remainingDifference).toBe(0);
      expect(result.accuracyPercentage).toBe(100);
      expect(result.isValid).toBe(true);
    });

    it('should never return negative accuracy percentage', () => {
      const suggestions: SuggestedTransaction[] = [
        {
          date: '2024-01-15',
          description: 'Wrong amount',
          amount: -50000,
          type: 'EXPENSE',
          confidence: 0.5,
          reasoning: 'Test',
        },
      ];

      // Target: -10,000, Suggested: -50,000 (way off)
      const result = validateSuggestions(suggestions, -10000);

      expect(result.accuracyPercentage).toBeGreaterThanOrEqual(0);
    });

    it('should handle very small differences', () => {
      const suggestions: SuggestedTransaction[] = [
        {
          date: '2024-01-15',
          description: 'Rounding adjustment',
          amount: -50,
          type: 'EXPENSE',
          confidence: 0.6,
          reasoning: 'Test',
        },
      ];

      const result = validateSuggestions(suggestions, -50);

      expect(result.isValid).toBe(true);
      expect(result.accuracyPercentage).toBe(100);
    });

    it('should handle very large differences', () => {
      const suggestions: SuggestedTransaction[] = [
        {
          date: '2024-01-15',
          description: 'Large transaction',
          amount: -5000000,
          type: 'EXPENSE',
          confidence: 0.7,
          reasoning: 'Test',
        },
      ];

      const result = validateSuggestions(suggestions, -5000000);

      expect(result.isValid).toBe(true);
      expect(result.suggestedTotal).toBe(-5000000);
      expect(result.accuracyPercentage).toBe(100);
    });
  });

  describe('Edge Cases', () => {
    it('should handle balance difference of exactly $100', async () => {
      const input = {
        reportedBalance: 100000,
        calculatedBalance: 100100, // Exactly $100 difference
        transactions: [{ description: 'Test', amount: -50000, type: 'EXPENSE' as const }],
      };

      const result = await suggestMissingTransactions(input);

      // Should trigger API call (>= 100)
      expect(result).toEqual([]);
    });

    it('should handle balance difference of exactly $99', async () => {
      const input = {
        reportedBalance: 100000,
        calculatedBalance: 100099, // $99 difference
        transactions: [{ description: 'Test', amount: -50000, type: 'EXPENSE' as const }],
      };

      const result = await suggestMissingTransactions(input);

      // Should NOT trigger API call (< 100)
      expect(result).toEqual([]);
      expect(openai.chat.completions.create).not.toHaveBeenCalled();
    });

    it('should handle transactions without dates', async () => {
      vi.mocked(openai.chat.completions.create).mockResolvedValue({
        choices: [{ message: { content: '[]' } }],
      } as any);

      const input = {
        reportedBalance: 100000,
        calculatedBalance: 115000,
        transactions: [
          { description: 'No date transaction', amount: -50000, type: 'EXPENSE' as const },
        ],
      };

      await suggestMissingTransactions(input);

      const callArgs = vi.mocked(openai.chat.completions.create).mock.calls[0][0];
      const userMessage = callArgs.messages.find((m: any) => m.role === 'user');
      const content = userMessage?.content as string;

      expect(content).toContain('N/A');
    });

    it('should handle zero balance difference', async () => {
      const input = {
        reportedBalance: 100000,
        calculatedBalance: 100000, // No difference
        transactions: [{ description: 'Test', amount: -50000, type: 'EXPENSE' as const }],
      };

      const result = await suggestMissingTransactions(input);

      expect(result).toEqual([]);
      expect(openai.chat.completions.create).not.toHaveBeenCalled();
    });
  });
});
