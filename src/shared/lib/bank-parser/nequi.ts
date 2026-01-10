/**
 * Nequi CSV Parser
 * Parses Nequi digital wallet statement CSV files
 */
import Papa from 'papaparse';
import type { BankParser, BankParseResult, ParsedTransaction } from './types';

export const nequiParser: BankParser = {
  detect(csv: string): boolean {
    return (
      csv.includes('NEQUI') ||
      csv.includes('nequi.com.co') ||
      csv.match(/Fecha,Concepto,Monto/i) !== null
    );
  },

  parse(csv: string): BankParseResult {
    const parsed = Papa.parse(csv, {
      header: false,
      skipEmptyLines: true,
    });

    const rows = parsed.data as string[][];
    const transactions: ParsedTransaction[] = [];
    let dataStarted = false;

    for (const row of rows) {
      // Detect header row
      if (!dataStarted && row[0]?.toLowerCase().includes('fecha')) {
        dataStarted = true;
        continue; // Skip header
      }

      if (!dataStarted) continue;

      const dateStr = row[0];
      const description = row[1];
      const amountStr = row[2];

      if (!dateStr || !description || !amountStr) continue;

      // Parse date (YYYY-MM-DD or DD/MM/YYYY)
      let date: Date;
      if (dateStr.includes('-')) {
        // ISO format YYYY-MM-DD
        date = new Date(dateStr);
      } else {
        // Colombian format DD/MM/YYYY
        const [day, month, year] = dateStr.split('/').map(Number);
        date = new Date(year, month - 1, day);
      }

      // Parse amount (puede tener $, comas)
      const amount = parseFloat(amountStr.replace(/[$,\s]/g, ''));

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
        bankName: 'Nequi',
        accountType: 'SAVINGS',
        suggestedName: 'Ahorros Nequi',
      },
      transactions,
      confidence: 0.85,
    };
  },
};
