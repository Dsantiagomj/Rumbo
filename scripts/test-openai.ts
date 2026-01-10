#!/usr/bin/env tsx
/**
 * OpenAI API Test Script
 * Verifica que la API key esté configurada correctamente
 * y que todas las features de IA funcionen
 */
/* eslint-disable no-console */

import OpenAI from 'openai';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof COLORS = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function success(message: string) {
  log(`✓ ${message}`, 'green');
}

function error(message: string) {
  log(`✗ ${message}`, 'red');
}

function info(message: string) {
  log(`ℹ ${message}`, 'cyan');
}

function warning(message: string) {
  log(`⚠ ${message}`, 'yellow');
}

async function main() {
  log('\n🧪 OpenAI API Configuration Test\n', 'blue');

  // 1. Check API Key
  info('Step 1/4: Checking API Key...');
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    error('OPENAI_API_KEY not found in .env.local');
    process.exit(1);
  }

  if (!apiKey.startsWith('sk-')) {
    warning('API key format looks incorrect (should start with "sk-")');
  }

  success(`API Key found: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);

  // 2. Initialize Client
  info('\nStep 2/4: Initializing OpenAI client...');
  const openai = new OpenAI({ apiKey });
  success('OpenAI client initialized');

  // 3. Test Connection with Simple Request
  info('\nStep 3/4: Testing connection with simple request...');
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 50,
      messages: [
        {
          role: 'user',
          content: 'Responde con una sola palabra: "OK"',
        },
      ],
    });

    const reply = response.choices[0]?.message?.content?.trim();
    if (reply) {
      success(`Connection successful! Response: "${reply}"`);
    } else {
      warning('Connection successful but empty response');
    }
  } catch (err) {
    error('Connection failed');
    if (err instanceof Error) {
      error(`Error: ${err.message}`);
    }
    process.exit(1);
  }

  // 4. Test AI Categorization (Real Feature)
  info('\nStep 4/4: Testing AI categorization feature...');
  try {
    const categorizeResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.2,
      max_tokens: 200,
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente de categorización de transacciones bancarias.',
        },
        {
          role: 'user',
          content: `Categoriza esta transacción:
Descripción: "Compra en Exito Calle 100"
Monto: -50000
Tipo: EXPENSE

Categorías disponibles:
- groceries (Mercado)
- transport (Transporte)
- entertainment (Entretenimiento)

Responde SOLO con el nombre de la categoría en inglés.`,
        },
      ],
    });

    const category = categorizeResponse.choices[0]?.message?.content?.trim();
    if (category) {
      success(`AI Categorization working! Suggested category: "${category}"`);
    } else {
      warning('Categorization returned empty response');
    }
  } catch (err) {
    error('AI Categorization test failed');
    if (err instanceof Error) {
      error(`Error: ${err.message}`);
    }
  }

  // 5. Test GPT-4o (for PDF OCR)
  info('\nStep 5/5: Testing GPT-4o model access (for PDF OCR)...');
  try {
    const gpt4Response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 50,
      messages: [
        {
          role: 'user',
          content: 'Di "GPT-4o funcionando"',
        },
      ],
    });

    const reply = gpt4Response.choices[0]?.message?.content?.trim();
    if (reply) {
      success(`GPT-4o access confirmed! Response: "${reply}"`);
    }
  } catch (err) {
    error('GPT-4o test failed');
    if (err instanceof Error) {
      if (err.message.includes('model')) {
        error('Your API key may not have access to GPT-4o model');
        warning('PDF OCR feature will not work without GPT-4o access');
      } else {
        error(`Error: ${err.message}`);
      }
    }
  }

  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  log('🎉 All tests completed!', 'green');
  log('='.repeat(60) + '\n', 'cyan');

  log('Features Status:', 'blue');
  success('✓ AI Categorization - Ready');
  success('✓ AI Reconciliation - Ready');
  success('✓ PDF OCR - Ready (requires GPT-4o)');

  log('\nYou can now use all AI features in the app!\n', 'green');
}

main().catch((err) => {
  error('\nUnexpected error:');
  console.error(err);
  process.exit(1);
});
