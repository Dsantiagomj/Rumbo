import OpenAI from 'openai';

/**
 * OpenAI Client Singleton
 * Used for PDF OCR and transaction categorization
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
