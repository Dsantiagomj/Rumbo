/**
 * PDF OCR with OpenAI Vision API
 * Extracts bank statement data from PDF images (PNG)
 *
 * Note: PDF to PNG conversion happens on the client side.
 * This server-side function only processes PNG images with OpenAI Vision API.
 */
import { openai } from '@/shared/lib/openai';
import type { ChatCompletionContentPart } from 'openai/resources/chat/completions';
import type { BankParseResult } from '@/shared/lib/bank-parser/types';

/**
 * Custom error for password-protected PDFs
 * Note: This is kept for backwards compatibility but password handling
 * now happens entirely on the client side
 */
export class PDFPasswordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PDFPasswordError';
  }
}

const PDF_OCR_PROMPT = `
Analiza este estado de cuenta bancario colombiano (puede tener múltiples páginas) y extrae la siguiente información:

1. **Banco**: Nombre del banco (Bancolombia, Nequi, Davivienda, etc.)
2. **Tipo de cuenta**: SAVINGS (ahorros), CHECKING (corriente), o CREDIT_CARD (tarjeta de crédito)
3. **Balance inicial**: Saldo al inicio del período (si está disponible)
4. **Balance final**: Saldo al final del período
5. **Transacciones**: Lista de TODAS las transacciones visibles en TODAS las páginas con:
   - Fecha (formato ISO 8601: YYYY-MM-DD)
   - Descripción (texto completo)
   - Monto (negativo para gastos/débitos, positivo para ingresos/créditos)

IMPORTANTE:
- Si hay MÚLTIPLES PÁGINAS, analiza TODAS las páginas y extrae TODAS las transacciones de cada página
- Combina todas las transacciones de todas las páginas en una sola lista
- Los montos deben ser números (sin símbolos de moneda ni comas)
- Las fechas deben estar en formato YYYY-MM-DD
- Si ves "Retiros" o "Débitos", usa montos negativos
- Si ves "Consignaciones" o "Créditos", usa montos positivos
- NO omitas transacciones por falta de espacio - incluye TODAS las que veas

Devuelve SOLO un JSON válido con esta estructura:
{
  "bankName": string,
  "accountType": "SAVINGS" | "CHECKING" | "CREDIT_CARD",
  "initialBalance": number | null,
  "finalBalance": number,
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": string,
      "amount": number
    }
  ]
}

NO incluyas texto adicional fuera del JSON. NO uses markdown. SOLO el JSON.
`;

interface PDFOCRResponse {
  bankName: string;
  accountType: 'SAVINGS' | 'CHECKING' | 'CREDIT_CARD';
  initialBalance?: number | null;
  finalBalance: number;
  transactions: Array<{
    date: string;
    description: string;
    amount: number;
  }>;
}

/**
 * Parse bank statement images (PNG) using OpenAI Vision API
 *
 * @param base64PNGs - Array of base64 encoded PNG images (one per page)
 * @returns Parsed bank account and transactions
 */
export async function parseBankPDF(base64PNGs: string[]): Promise<BankParseResult> {
  try {
    // Build content array with prompt + all page images
    const content: ChatCompletionContentPart[] = [
      {
        type: 'text',
        text: PDF_OCR_PROMPT,
      },
    ];

    // Add all pages as images
    for (const base64PNG of base64PNGs) {
      content.push({
        type: 'image_url',
        image_url: {
          url: `data:image/png;base64,${base64PNG}`,
          detail: 'high', // High detail for better accuracy
        },
      });
    }

    // Process all PNG images with OpenAI Vision API in a single call
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 16384, // Increased for multi-page PDFs with many transactions
      temperature: 0.1, // Low temperature for consistent parsing
      messages: [
        {
          role: 'user',
          content,
        },
      ],
    });

    const responseContent = response.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    // Parse JSON response (remove any markdown formatting if present)
    const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta');
    }

    const data: PDFOCRResponse = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!data.bankName || !data.accountType || !data.finalBalance || !data.transactions) {
      throw new Error('Respuesta incompleta de OpenAI');
    }

    // Transform to BankParseResult
    const transactions = data.transactions.map((tx) => ({
      date: new Date(tx.date),
      amount: tx.amount,
      description: tx.description,
      rawDescription: tx.description,
      type: tx.amount < 0 ? ('EXPENSE' as const) : ('INCOME' as const),
    }));

    // Determine account type label in Spanish
    let accountTypeLabel = 'Ahorros';
    if (data.accountType === 'CHECKING') accountTypeLabel = 'Corriente';
    if (data.accountType === 'CREDIT_CARD') accountTypeLabel = 'Tarjeta';

    return {
      account: {
        bankName: data.bankName,
        accountType: data.accountType,
        suggestedName: `${accountTypeLabel} ${data.bankName}`,
        reportedBalance: data.finalBalance,
      },
      transactions,
      confidence: 0.8, // Lower confidence than CSV since OCR can have errors
    };
  } catch (error) {
    console.error('PDF OCR Error:', error);

    // Re-throw PDFPasswordError as-is (kept for backwards compatibility)
    if (error instanceof PDFPasswordError) {
      throw error;
    }

    if (error instanceof Error) {
      // Check for specific errors
      if (error.message.includes('API key')) {
        throw new Error('Error de configuración: API key de OpenAI no configurada');
      }
      if (error.message.includes('quota')) {
        throw new Error('Límite de API alcanzado. Intenta más tarde.');
      }
      if (error.message.includes('timeout')) {
        throw new Error('Timeout procesando PDF. El archivo es demasiado grande.');
      }
    }

    throw new Error(
      'No se pudo procesar el PDF. Verifica que sea un estado de cuenta bancario válido y legible.',
    );
  }
}

/**
 * Estimate OCR cost for analytics
 * OpenAI Vision pricing: ~$0.01 per image
 */
export function estimateOCRCost(fileSize: number): number {
  // Assume 1 page PDF ≈ 1 image for estimation
  const estimatedPages = Math.ceil(fileSize / (1024 * 1024)); // 1MB per page approximation
  return estimatedPages * 0.01;
}
