/**
 * Bank Parser Types
 * Type definitions for parsing bank statements (CSV and PDF)
 */

export interface ParsedTransaction {
  date: Date;
  amount: number;
  description: string;
  rawDescription: string;
  type: 'EXPENSE' | 'INCOME';
}

export interface DetectedAccount {
  bankName: string;
  accountType: 'SAVINGS' | 'CHECKING' | 'CREDIT_CARD';
  suggestedName: string;
  reportedBalance?: number;
}

export interface BankParseResult {
  account: DetectedAccount;
  transactions: ParsedTransaction[];
  confidence: number; // 0-1 confidence score
}

export interface BankParser {
  detect(csvContent: string): boolean;
  parse(csvContent: string): BankParseResult;
}
