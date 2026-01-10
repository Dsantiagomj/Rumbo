/**
 * Bank Parser Main Entry Point
 * Detects and parses Colombian bank CSV formats
 */
import type { BankParser, BankParseResult } from './types';
import { bancolombiaParser } from './bancolombia';
import { nequiParser } from './nequi';
import { daviviendaParser } from './davivienda';

const PARSERS: BankParser[] = [bancolombiaParser, nequiParser, daviviendaParser];

/**
 * Parse bank CSV file
 * Auto-detects bank format and parses transactions
 */
export async function parseBankCSV(csvContent: string): Promise<BankParseResult | null> {
  for (const parser of PARSERS) {
    if (parser.detect(csvContent)) {
      return parser.parse(csvContent);
    }
  }

  return null;
}

export * from './types';
