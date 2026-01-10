/**
 * AI-Assisted Reconciliation Utility
 * Uses GPT-4 to suggest missing transactions when balance doesn't match
 */
import { openai } from '@/shared/lib/openai';

interface Transaction {
  description: string;
  amount: number;
  type: 'EXPENSE' | 'INCOME';
  date?: Date;
}

interface ReconciliationInput {
  reportedBalance: number;
  calculatedBalance: number;
  transactions: Transaction[];
}

export interface SuggestedTransaction {
  date: string; // ISO format YYYY-MM-DD
  description: string;
  amount: number;
  type: 'EXPENSE' | 'INCOME';
  confidence: number; // 0-1
  reasoning: string;
}

const AI_RECONCILIATION_PROMPT = `Eres un asistente experto en reconciliación bancaria para Colombia.

Analiza este estado de cuenta bancario que tiene una discrepancia de balance.

**Situación:**
- Balance reportado por el banco: {reportedBalance}
- Balance calculado de las transacciones: {calculatedBalance}
- Diferencia: {difference} ({differenceType})

**Transacciones detectadas:**
{transactionsList}

**Tu tarea:**
Con base en:
1. El monto faltante ({difference})
2. Los patrones en las transacciones existentes (frecuencia, montos típicos, comercios)
3. Las fechas y períodos de las transacciones
4. Conocimiento de cargos bancarios comunes en Colombia (cuotas de manejo, seguros, intereses, retiros en cajero, etc.)

Sugiere entre 1 y 5 transacciones que probablemente estén faltando y expliquen la discrepancia.

**Reglas importantes:**
- Las transacciones sugeridas deben sumar aproximadamente la diferencia
- Considera cargos bancarios típicos en Colombia (cuota de manejo ~$10,000-$30,000, seguros, GMF 4x1000)
- Si la diferencia es pequeña (<$5,000), probablemente sea redondeo o ajuste
- Si la diferencia es grande, pueden ser múltiples transacciones
- Las fechas deben estar dentro del período de las transacciones existentes
- Sé conservador: mejor sugerir menos transacciones con alta confianza

Responde ÚNICAMENTE con un JSON válido (sin markdown, sin texto adicional):

[
  {
    "date": "YYYY-MM-DD",
    "description": "Descripción clara y específica",
    "amount": número_negativo_para_gastos_o_positivo_para_ingresos,
    "type": "EXPENSE" o "INCOME",
    "confidence": número_entre_0_y_1,
    "reasoning": "Explicación breve de por qué crees que esta transacción falta"
  }
]

Si no puedes sugerir transacciones con confianza razonable (confidence < 0.4), devuelve un array vacío: []
`;

/**
 * Use AI to suggest missing transactions based on balance discrepancy
 */
export async function suggestMissingTransactions(
  input: ReconciliationInput,
): Promise<SuggestedTransaction[]> {
  const difference = input.reportedBalance - input.calculatedBalance;

  // If difference is negligible (< $100), don't suggest anything
  if (Math.abs(difference) < 100) {
    return [];
  }

  const differenceType = difference > 0 ? 'falta(n) ingreso(s)' : 'falta(n) gasto(s)';

  // Format transactions list
  const transactionsList = input.transactions
    .slice(0, 50) // Limit to last 50 to avoid token limits
    .map((tx) => {
      const date = tx.date ? tx.date.toISOString().split('T')[0] : 'N/A';
      const sign = tx.amount >= 0 ? '+' : '';
      return `${date}: ${tx.description} - ${sign}$${tx.amount.toLocaleString('es-CO')}`;
    })
    .join('\n');

  // Build prompt
  const prompt = AI_RECONCILIATION_PROMPT.replace(
    '{reportedBalance}',
    `$${input.reportedBalance.toLocaleString('es-CO')}`,
  )
    .replace('{calculatedBalance}', `$${input.calculatedBalance.toLocaleString('es-CO')}`)
    .replace('{difference}', `$${Math.abs(difference).toLocaleString('es-CO')}`)
    .replace('{differenceType}', differenceType)
    .replace('{transactionsList}', transactionsList)
    .replace('{difference}', `$${Math.abs(difference).toLocaleString('es-CO')}`);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.3, // Low temperature for consistent results
      max_tokens: 1000,
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente de reconciliación bancaria experto para Colombia.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    // Parse JSON response (handle potential markdown wrapping)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('AI response was not valid JSON:', content);
      return [];
    }

    const suggestions: SuggestedTransaction[] = JSON.parse(jsonMatch[0]);

    // Validate and filter suggestions
    const validSuggestions = suggestions.filter((suggestion) => {
      return (
        suggestion.date &&
        suggestion.description &&
        typeof suggestion.amount === 'number' &&
        (suggestion.type === 'EXPENSE' || suggestion.type === 'INCOME') &&
        typeof suggestion.confidence === 'number' &&
        suggestion.confidence > 0 &&
        suggestion.confidence <= 1 &&
        suggestion.reasoning
      );
    });

    // Sort by confidence (highest first)
    return validSuggestions.sort((a, b) => b.confidence - a.confidence);
  } catch (error) {
    console.error('AI Reconciliation error:', error);

    // Check for specific errors - log them but don't throw
    // This allows the user to continue with manual reconciliation
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        console.error('Error de configuración: API key de OpenAI no configurada');
        return [];
      }
      if (error.message.includes('quota')) {
        console.error('Límite de API alcanzado. Intenta más tarde.');
        return [];
      }
      if (error.message.includes('No se recibió respuesta')) {
        // Re-throw this specific error
        throw error;
      }
    }

    // Return empty array on other errors
    return [];
  }
}

/**
 * Calculate if suggested transactions would resolve the balance discrepancy
 */
export function validateSuggestions(
  suggestions: SuggestedTransaction[],
  targetDifference: number,
): {
  isValid: boolean;
  suggestedTotal: number;
  remainingDifference: number;
  accuracyPercentage: number;
} {
  const suggestedTotal = suggestions.reduce((sum, suggestion) => {
    return sum + suggestion.amount;
  }, 0);

  const remainingDifference = targetDifference - suggestedTotal;
  const accuracyPercentage = Math.max(
    0,
    100 - (Math.abs(remainingDifference) / Math.abs(targetDifference)) * 100,
  );

  return {
    isValid: Math.abs(remainingDifference) < 1000, // Within $1,000 is considered valid
    suggestedTotal,
    remainingDifference,
    accuracyPercentage,
  };
}
