/**
 * Bancolombia CSV Parser
 * Parses Bancolombia bank statement CSV files
 */
import Papa from 'papaparse';
import type { BankParser, BankParseResult, ParsedTransaction } from './types';

export const bancolombiaParser: BankParser = {
  detect(csv: string): boolean {
    return (
      csv.includes('BANCOLOMBIA') ||
      csv.match(/Fecha,Descripci[oó]n,Valor/i) !== null ||
      csv.match(/Fecha,Referencia,Descripcion,Retiros,Consignaciones/i) !== null
    );
  },

  parse(csv: string): BankParseResult {
    const parsed = Papa.parse(csv, {
      header: false,
      skipEmptyLines: true,
    });

    const rows = parsed.data as string[][];

    // Detect account type from headers or content
    let accountType: 'SAVINGS' | 'CHECKING' | 'CREDIT_CARD' = 'SAVINGS';
    if (csv.toLowerCase().includes('corriente')) accountType = 'CHECKING';
    if (csv.toLowerCase().includes('crédito') || csv.toLowerCase().includes('credito')) {
      accountType = 'CREDIT_CARD';
    }

    // Find balance (usually in last rows)
    let reportedBalance: number | undefined;
    const balanceRow = rows.find((row) =>
      row.some((cell) => cell.includes('Saldo') || cell.includes('Balance')),
    );
    if (balanceRow) {
      const balanceStr = balanceRow.find((cell) => /[\d,]+\.\d{2}/.test(cell));
      if (balanceStr) {
        reportedBalance = parseFloat(balanceStr.replace(/,/g, ''));
      }
    }

    // Parse transactions
    const transactions: ParsedTransaction[] = [];
    let dataStarted = false;

    for (const row of rows) {
      // Detect data start (after headers)
      if (!dataStarted && row.some((cell) => /^\d{2}\/\d{2}\/\d{4}$/.test(cell))) {
        dataStarted = true;
      }

      if (!dataStarted) continue;

      // Skip if looks like header or empty
      if (
        row.some((cell) => cell.toLowerCase().includes('fecha')) ||
        row.every((cell) => !cell || cell.trim() === '')
      ) {
        continue;
      }

      // Parse row: [Fecha, Descripcion, Retiros, Consignaciones] or similar
      const dateStr = row[0];
      const description = row[1] || row[2];
      const debit = row[2] || row[3];
      const credit = row[3] || row[4];

      if (!dateStr || !description) continue;

      // Parse date (DD/MM/YYYY)
      const dateMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!dateMatch) continue;

      const [, day, month, year] = dateMatch;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

      // Parse amount
      let amount: number;
      if (credit && credit !== '' && credit !== '-') {
        amount = parseFloat(credit.replace(/[,$]/g, ''));
      } else if (debit && debit !== '' && debit !== '-') {
        amount = -parseFloat(debit.replace(/[,$]/g, ''));
      } else {
        continue; // Skip if no amount
      }

      if (isNaN(amount)) continue;

      transactions.push({
        date,
        amount,
        description: description.trim(),
        rawDescription: description.trim(),
        type: amount < 0 ? 'EXPENSE' : 'INCOME',
      });
    }

    return {
      account: {
        bankName: 'Bancolombia',
        accountType,
        suggestedName: `${accountType === 'SAVINGS' ? 'Ahorros' : accountType === 'CHECKING' ? 'Corriente' : 'Tarjeta'} Bancolombia`,
        reportedBalance,
      },
      transactions,
      confidence: 0.9,
    };
  },
};
