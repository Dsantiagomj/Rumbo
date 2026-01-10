/**
 * Account Detection Utilities
 * Analyzes transactions to suggest additional accounts the user should configure
 */

export type SuggestedAccountType = 'CREDIT_CARD' | 'CASH' | 'INVESTMENT' | 'SAVINGS_ACCOUNT';

export interface AccountSuggestion {
  type: SuggestedAccountType;
  reason: string;
  transactions: Array<{
    description: string;
    date: Date;
    amount: number;
  }>;
  confidence: number;
}

/**
 * Patterns to detect different account types in transaction descriptions
 */
const PATTERNS = {
  CREDIT_CARD: [
    /pago\s*(automatico|automático)?\s*t\.?c\.?/i, // Pago TC, Pago Automatico TC
    /pago\s*tarjeta\s*(de\s*)?crédito/i, // Pago tarjeta de credito
    /pago\s*visa/i, // Pago Visa
    /pago\s*mastercard/i, // Pago Mastercard
    /pago\s*amex/i, // Pago Amex
    /cuota\s*t\.?c\.?/i, // Cuota TC
    /avance\s*tarjeta/i, // Avance tarjeta
  ],
  CASH: [
    /retiro\s*cajero/i, // Retiro cajero
    /retiro\s*atm/i, // Retiro ATM
    /retiro\s*efectivo/i, // Retiro efectivo
    /cajero\s*automático/i, // Cajero automatico
    /retiro\s*por\s*cajero/i, // Retiro por cajero
  ],
  INVESTMENT: [
    /inversión/i, // Inversion
    /compra\s*acciones/i, // Compra acciones
    /fondos?\s*de\s*inversión/i, // Fondo de inversion
    /transferencia\s*a\s*cdt/i, // Transferencia a CDT
    /apertura\s*cdt/i, // Apertura CDT
  ],
  SAVINGS_ACCOUNT: [
    /ahorro\s*programado/i, // Ahorro programado
    /transferencia\s*a\s*ahorros/i, // Transferencia a ahorros
    /bolsillo/i, // Bolsillo (Nequi/Daviplata feature)
  ],
};

/**
 * Analyzes transactions and returns suggestions for additional accounts
 */
export function detectAdditionalAccounts(
  transactions: Array<{
    description: string;
    date: Date;
    amount: number;
  }>,
): AccountSuggestion[] {
  const suggestions: Map<SuggestedAccountType, AccountSuggestion> = new Map();

  for (const transaction of transactions) {
    // Check each pattern type
    for (const [accountType, patterns] of Object.entries(PATTERNS)) {
      const matchedPattern = patterns.find((pattern) => pattern.test(transaction.description));

      if (matchedPattern) {
        const type = accountType as SuggestedAccountType;

        if (!suggestions.has(type)) {
          suggestions.set(type, {
            type,
            reason: getReasonForAccountType(type),
            transactions: [],
            confidence: 0,
          });
        }

        const suggestion = suggestions.get(type)!;
        suggestion.transactions.push({
          description: transaction.description,
          date: transaction.date,
          amount: transaction.amount,
        });
      }
    }
  }

  // Calculate confidence based on frequency
  const result: AccountSuggestion[] = [];
  for (const suggestion of suggestions.values()) {
    const frequency = suggestion.transactions.length;
    const totalTransactions = transactions.length;

    // Confidence based on:
    // - High: 5+ occurrences or >10% of transactions
    // - Medium: 3-4 occurrences or 5-10% of transactions
    // - Low: 1-2 occurrences
    let confidence = 0;
    if (frequency >= 5 || frequency / totalTransactions > 0.1) {
      confidence = 0.9;
    } else if (frequency >= 3 || frequency / totalTransactions > 0.05) {
      confidence = 0.7;
    } else {
      confidence = 0.5;
    }

    result.push({ ...suggestion, confidence });
  }

  // Sort by confidence (highest first)
  return result.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Returns user-friendly reason for each account type suggestion
 */
function getReasonForAccountType(type: SuggestedAccountType): string {
  switch (type) {
    case 'CREDIT_CARD':
      return 'Detectamos pagos de tarjeta de crédito. Estas transacciones son movimientos (no gastos reales). Considera agregar tu tarjeta de crédito como cuenta para ver tu cupo disponible.';
    case 'CASH':
      return 'Detectamos retiros de cajero. Estos son movimientos de tu cuenta a efectivo (no gastos). Agrega una cuenta de efectivo para rastrear cómo usas el dinero en cash.';
    case 'INVESTMENT':
      return 'Detectamos inversiones. Agrega una cuenta de inversiones para ver el rendimiento de tu portafolio.';
    case 'SAVINGS_ACCOUNT':
      return 'Detectamos ahorros automáticos. Configura una cuenta de ahorros para ver tu progreso hacia tus metas.';
  }
}

/**
 * Returns user-friendly label for account type
 */
export function getAccountTypeLabel(type: SuggestedAccountType): string {
  switch (type) {
    case 'CREDIT_CARD':
      return 'Tarjeta de Crédito';
    case 'CASH':
      return 'Efectivo';
    case 'INVESTMENT':
      return 'Inversiones';
    case 'SAVINGS_ACCOUNT':
      return 'Cuenta de Ahorros';
  }
}
