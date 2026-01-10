/**
 * AI Categorization Utility
 * Uses GPT-4 to automatically categorize transactions
 */
import { openai } from '@/shared/lib/openai';

interface Transaction {
  description: string;
  amount: number;
  type: 'EXPENSE' | 'INCOME';
}

interface Category {
  key: string;
  name: string;
  type: 'EXPENSE' | 'INCOME';
}

interface CategorizationResult {
  index: number;
  categoryKey: string;
  confidence: number;
}

const AI_CATEGORIZATION_PROMPT = `
Eres un asistente financiero experto en categorizar transacciones bancarias colombianas.

Tu tarea es asignar una categoría a cada transacción basándote en su descripción y tipo.

**Categorías disponibles:**
{CATEGORIES_LIST}

**Transacciones a categorizar:**
{TRANSACTIONS_LIST}

IMPORTANTE:
- Analiza el contexto y palabras clave de cada descripción
- Asigna la categoría más apropiada según el tipo de transacción (EXPENSE o INCOME)
- Solo usa categorías que coincidan con el tipo de transacción
- Si no estás seguro, usa "OTHER" con baja confianza
- Devuelve un score de confianza entre 0 y 1

Devuelve SOLO un JSON válido con esta estructura (sin markdown ni texto adicional):
[
  {
    "index": 0,
    "categoryKey": "FOOD",
    "confidence": 0.95
  },
  {
    "index": 1,
    "categoryKey": "TRANSPORT",
    "confidence": 0.85
  }
]

NO incluyas texto adicional fuera del array JSON.
`;

/**
 * Categorize transactions using GPT-4
 * @param transactions - Array of transactions to categorize
 * @param categories - Available categories
 * @returns Array of categorization results
 */
export async function categorizeTransactions(
  transactions: Transaction[],
  categories: Category[],
): Promise<CategorizationResult[]> {
  try {
    // Limit to 50 transactions per batch to avoid token limits
    const batchSize = 50;
    const batches: Transaction[][] = [];

    for (let i = 0; i < transactions.length; i += batchSize) {
      batches.push(transactions.slice(i, i + batchSize));
    }

    const allResults: CategorizationResult[] = [];

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const offset = batchIndex * batchSize;

      // Build categories list
      const categoriesList = categories
        .map((cat) => `- ${cat.key}: ${cat.name} (${cat.type})`)
        .join('\n');

      // Build transactions list
      const transactionsList = batch
        .map(
          (tx, idx) =>
            `${idx}. "${tx.description}" (${tx.type}, ${tx.amount >= 0 ? 'Ingreso' : 'Gasto'})`,
        )
        .join('\n');

      // Create prompt
      const prompt = AI_CATEGORIZATION_PROMPT.replace('{CATEGORIES_LIST}', categoriesList).replace(
        '{TRANSACTIONS_LIST}',
        transactionsList,
      );

      // Call OpenAI
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        temperature: 0.3, // Low temperature for consistency
        max_tokens: 2000,
        messages: [
          {
            role: 'system',
            content:
              'Eres un asistente financiero que categoriza transacciones bancarias con precisión.',
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

      // Parse JSON response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No se pudo extraer JSON de la respuesta');
      }

      const batchResults: CategorizationResult[] = JSON.parse(jsonMatch[0]);

      // Adjust indices for batch offset
      const adjustedResults = batchResults.map((result) => ({
        ...result,
        index: result.index + offset,
      }));

      allResults.push(...adjustedResults);
    }

    return allResults;
  } catch (error) {
    console.error('AI Categorization Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Error de configuración: API key de OpenAI no configurada');
      }
      if (error.message.includes('quota')) {
        throw new Error('Límite de API alcanzado. Intenta más tarde.');
      }
    }

    throw new Error('No se pudo categorizar las transacciones automáticamente.');
  }
}

/**
 * Estimate categorization cost
 * GPT-4 Turbo pricing: ~$0.01 per 1000 tokens (input) + $0.03 per 1000 tokens (output)
 */
export function estimateCategorizationCost(transactionCount: number): number {
  // Rough estimation: ~100 tokens per transaction + categories list
  const estimatedInputTokens = transactionCount * 100 + 500;
  const estimatedOutputTokens = transactionCount * 20; // ~20 tokens per result

  const inputCost = (estimatedInputTokens / 1000) * 0.01;
  const outputCost = (estimatedOutputTokens / 1000) * 0.03;

  return inputCost + outputCost;
}

/**
 * Apply categorization results to transactions
 */
export function applyCategorization<T extends { description: string }>(
  transactions: T[],
  results: CategorizationResult[],
  categories: Category[],
  confidenceThreshold = 0.5,
): Array<T & { categoryId?: string; confidence?: number }> {
  return transactions.map((tx, index) => {
    const result = results.find((r) => r.index === index);

    if (!result || result.confidence < confidenceThreshold) {
      return { ...tx, categoryId: undefined, confidence: 0 };
    }

    const category = categories.find((cat) => cat.key === result.categoryKey);

    return {
      ...tx,
      categoryId: category?.key,
      confidence: result.confidence,
    };
  });
}
