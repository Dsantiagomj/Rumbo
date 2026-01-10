/**
 * Duplicate Detection Utility Tests
 * Tests for fuzzy matching and duplicate transaction detection
 */
import { describe, it, expect } from 'vitest';
import {
  isDuplicate,
  findDuplicates,
  calculateDuplicatePercentage,
  type Transaction,
} from '@/features/import/utils/duplicate-detection';

describe('Duplicate Detection', () => {
  describe('isDuplicate', () => {
    it('should detect exact duplicates', () => {
      const tx1: Transaction = {
        date: new Date('2024-01-15'),
        amount: -50000,
        description: 'Compra en Exito Calle 100',
      };

      const tx2: Transaction = {
        date: new Date('2024-01-15'),
        amount: -50000,
        description: 'Compra en Exito Calle 100',
      };

      expect(isDuplicate(tx1, tx2)).toBe(true);
    });

    it('should detect duplicates with similar descriptions', () => {
      const tx1: Transaction = {
        date: new Date('2024-01-15'),
        amount: -50000,
        description: 'Compra en Exito Calle 100',
      };

      const tx2: Transaction = {
        date: new Date('2024-01-15'),
        amount: -50000,
        description: 'Compra en Éxito Calle 100', // Acento agregado
      };

      expect(isDuplicate(tx1, tx2)).toBe(true);
    });

    it('should detect duplicates within date tolerance', () => {
      const tx1: Transaction = {
        date: new Date('2024-01-15'),
        amount: -50000,
        description: 'Compra en Exito',
      };

      const tx2: Transaction = {
        date: new Date('2024-01-16'), // 1 día después
        amount: -50000,
        description: 'Compra en Exito',
      };

      expect(isDuplicate(tx1, tx2)).toBe(true);
    });

    it('should NOT detect as duplicate if amount differs', () => {
      const tx1: Transaction = {
        date: new Date('2024-01-15'),
        amount: -50000,
        description: 'Compra en Exito',
      };

      const tx2: Transaction = {
        date: new Date('2024-01-15'),
        amount: -45000, // Monto diferente
        description: 'Compra en Exito',
      };

      expect(isDuplicate(tx1, tx2)).toBe(false);
    });

    it('should NOT detect as duplicate if date is beyond tolerance', () => {
      const tx1: Transaction = {
        date: new Date('2024-01-15'),
        amount: -50000,
        description: 'Compra en Exito',
      };

      const tx2: Transaction = {
        date: new Date('2024-01-18'), // 3 días después
        amount: -50000,
        description: 'Compra en Exito',
      };

      expect(isDuplicate(tx1, tx2)).toBe(false);
    });

    it('should NOT detect as duplicate if description is too different', () => {
      const tx1: Transaction = {
        date: new Date('2024-01-15'),
        amount: -50000,
        description: 'Compra en Exito',
      };

      const tx2: Transaction = {
        date: new Date('2024-01-15'),
        amount: -50000,
        description: 'Pago de servicios', // Descripción completamente diferente
      };

      expect(isDuplicate(tx1, tx2)).toBe(false);
    });

    it('should handle UTF-8 characters (tildes, ñ)', () => {
      const tx1: Transaction = {
        date: new Date('2024-01-15'),
        amount: -10000,
        description: 'Peñón Café',
      };

      const tx2: Transaction = {
        date: new Date('2024-01-15'),
        amount: -10000,
        description: 'Peñon Cafe', // Sin tildes
      };

      expect(isDuplicate(tx1, tx2)).toBe(true);
    });

    it('should respect custom date tolerance', () => {
      const tx1: Transaction = {
        date: new Date('2024-01-15'),
        amount: -50000,
        description: 'Compra en Exito',
      };

      const tx2: Transaction = {
        date: new Date('2024-01-18'), // 3 días después
        amount: -50000,
        description: 'Compra en Exito',
      };

      // Default tolerance (1 day) = false
      expect(isDuplicate(tx1, tx2)).toBe(false);

      // Custom tolerance (3 days) = true
      expect(isDuplicate(tx1, tx2, { dateTolerance: 3 })).toBe(true);
    });

    it('should respect custom description similarity threshold', () => {
      const tx1: Transaction = {
        date: new Date('2024-01-15'),
        amount: -50000,
        description: 'Compra en Exito Calle 100',
      };

      const tx2: Transaction = {
        date: new Date('2024-01-15'),
        amount: -50000,
        description: 'Compra en Exito', // Más corta
      };

      // Lower threshold (0.6) makes it more likely to be detected as duplicate
      const result = isDuplicate(tx1, tx2, { descriptionSimilarity: 0.6 });

      expect(result).toBe(true);
    });
  });

  describe('findDuplicates', () => {
    it('should correctly identify duplicates and unique transactions', () => {
      const newTransactions: Transaction[] = [
        {
          date: new Date('2024-01-15'),
          amount: -50000,
          description: 'Compra en Exito',
        },
        {
          date: new Date('2024-01-16'),
          amount: -30000,
          description: 'Gasolina',
        },
        {
          date: new Date('2024-01-17'),
          amount: 1000000,
          description: 'Salario',
        },
      ];

      const existingTransactions: Transaction[] = [
        {
          date: new Date('2024-01-15'),
          amount: -50000,
          description: 'Compra en Exito', // Duplicado
        },
        {
          date: new Date('2024-01-10'),
          amount: -20000,
          description: 'Otro gasto',
        },
      ];

      const result = findDuplicates(newTransactions, existingTransactions);

      expect(result.duplicates).toHaveLength(1);
      expect(result.unique).toHaveLength(2);
      expect(result.duplicates[0].description).toBe('Compra en Exito');
      expect(result.unique.map((tx) => tx.description)).toContain('Gasolina');
      expect(result.unique.map((tx) => tx.description)).toContain('Salario');
    });

    it('should handle empty existing transactions', () => {
      const newTransactions: Transaction[] = [
        {
          date: new Date('2024-01-15'),
          amount: -50000,
          description: 'Compra',
        },
      ];

      const result = findDuplicates(newTransactions, []);

      expect(result.duplicates).toHaveLength(0);
      expect(result.unique).toHaveLength(1);
    });

    it('should handle empty new transactions', () => {
      const existingTransactions: Transaction[] = [
        {
          date: new Date('2024-01-15'),
          amount: -50000,
          description: 'Compra',
        },
      ];

      const result = findDuplicates([], existingTransactions);

      expect(result.duplicates).toHaveLength(0);
      expect(result.unique).toHaveLength(0);
    });

    it('should handle multiple duplicates', () => {
      const newTransactions: Transaction[] = [
        { date: new Date('2024-01-15'), amount: -50000, description: 'Compra 1' },
        { date: new Date('2024-01-16'), amount: -30000, description: 'Compra 2' },
        { date: new Date('2024-01-17'), amount: -20000, description: 'Compra 3' },
      ];

      const existingTransactions: Transaction[] = [
        { date: new Date('2024-01-15'), amount: -50000, description: 'Compra 1' },
        { date: new Date('2024-01-16'), amount: -30000, description: 'Compra 2' },
        { date: new Date('2024-01-17'), amount: -20000, description: 'Compra 3' },
      ];

      const result = findDuplicates(newTransactions, existingTransactions);

      expect(result.duplicates).toHaveLength(3);
      expect(result.unique).toHaveLength(0);
    });

    it('should handle real-world scenario: monthly re-import', () => {
      // Simular re-importación mensual con overlap
      const februaryTransactions: Transaction[] = [
        { date: new Date('2024-02-01'), amount: -50000, description: 'Compra Exito' },
        { date: new Date('2024-02-05'), amount: -30000, description: 'Gasolina' },
        { date: new Date('2024-02-10'), amount: 1000000, description: 'Salario' },
        { date: new Date('2024-02-15'), amount: -100000, description: 'Servicio Internet' },
      ];

      const januaryTransactions: Transaction[] = [
        { date: new Date('2024-01-20'), amount: -40000, description: 'Compra Carulla' },
        { date: new Date('2024-02-01'), amount: -50000, description: 'Compra Exito' }, // Overlap
        { date: new Date('2024-02-05'), amount: -30000, description: 'Gasolina' }, // Overlap
      ];

      const result = findDuplicates(februaryTransactions, januaryTransactions);

      expect(result.duplicates).toHaveLength(2); // Exito + Gasolina
      expect(result.unique).toHaveLength(2); // Salario + Internet
    });
  });

  describe('calculateDuplicatePercentage', () => {
    it('should calculate correct percentage', () => {
      const result = {
        duplicates: [
          { date: new Date(), amount: -50000, description: 'Test 1' },
          { date: new Date(), amount: -30000, description: 'Test 2' },
        ],
        unique: [
          { date: new Date(), amount: -20000, description: 'Test 3' },
          { date: new Date(), amount: -10000, description: 'Test 4' },
          { date: new Date(), amount: -5000, description: 'Test 5' },
          { date: new Date(), amount: -3000, description: 'Test 6' },
          { date: new Date(), amount: -2000, description: 'Test 7' },
          { date: new Date(), amount: -1000, description: 'Test 8' },
        ],
      };

      const percentage = calculateDuplicatePercentage(result);

      // 2 duplicates out of 8 total = 25%
      expect(percentage).toBe(25);
    });

    it('should return 0 for no duplicates', () => {
      const result = {
        duplicates: [],
        unique: [
          { date: new Date(), amount: -50000, description: 'Test 1' },
          { date: new Date(), amount: -30000, description: 'Test 2' },
        ],
      };

      expect(calculateDuplicatePercentage(result)).toBe(0);
    });

    it('should return 100 for all duplicates', () => {
      const result = {
        duplicates: [
          { date: new Date(), amount: -50000, description: 'Test 1' },
          { date: new Date(), amount: -30000, description: 'Test 2' },
        ],
        unique: [],
      };

      expect(calculateDuplicatePercentage(result)).toBe(100);
    });

    it('should return 0 for empty result', () => {
      const result = {
        duplicates: [],
        unique: [],
      };

      expect(calculateDuplicatePercentage(result)).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very similar amounts (floating point)', () => {
      const tx1: Transaction = {
        date: new Date('2024-01-15'),
        amount: -50000.01,
        description: 'Compra',
      };

      const tx2: Transaction = {
        date: new Date('2024-01-15'),
        amount: -50000.02,
        description: 'Compra',
      };

      // Amounts are different, so not duplicate
      expect(isDuplicate(tx1, tx2)).toBe(false);
    });

    it('should handle very long descriptions', () => {
      const longDesc =
        'Compra en Exito Calle 100 con tarjeta credito terminada en 1234 aprobada el dia 15 de enero de 2024 a las 10:30am';

      const tx1: Transaction = {
        date: new Date('2024-01-15'),
        amount: -50000,
        description: longDesc,
      };

      const tx2: Transaction = {
        date: new Date('2024-01-15'),
        amount: -50000,
        description: longDesc,
      };

      expect(isDuplicate(tx1, tx2)).toBe(true);
    });

    it('should handle special characters', () => {
      const tx1: Transaction = {
        date: new Date('2024-01-15'),
        amount: -50000,
        description: 'Compra @ Exito (50% descuento)',
      };

      const tx2: Transaction = {
        date: new Date('2024-01-15'),
        amount: -50000,
        description: 'Compra @ Exito (50% descuento)',
      };

      expect(isDuplicate(tx1, tx2)).toBe(true);
    });
  });
});
