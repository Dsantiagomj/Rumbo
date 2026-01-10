import OpenAI from 'openai';

/**
 * OpenAI Client Singleton
 * Used for PDF OCR and transaction categorization
 * Lazy initialization to avoid issues in test environment
 */
let _openai: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY && process.env.NODE_ENV !== 'test') {
      throw new Error('OPENAI_API_KEY is required');
    }

    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'sk-test-key',
    });
  }

  return _openai;
}

// For backwards compatibility
export const openai = new Proxy({} as OpenAI, {
  get(_, prop) {
    return getOpenAIClient()[prop as keyof OpenAI];
  },
});
