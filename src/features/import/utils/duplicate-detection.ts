/**
 * Duplicate Detection Utility
 * Detects duplicate transactions using fuzzy matching
 */

export interface Transaction {
  date: Date;
  amount: number;
  description: string;
}

export interface DuplicateDetectionResult {
  duplicates: Transaction[];
  unique: Transaction[];
}

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy string matching
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Normalize string by removing accents and special characters
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s]/g, ''); // Remove special characters except word chars and spaces
}

/**
 * Calculate similarity score between two strings (0-1)
 * 1 = identical, 0 = completely different
 */
function stringSimilarity(str1: string, str2: string): number {
  const s1 = normalizeString(str1);
  const s2 = normalizeString(str2);

  if (s1 === s2) return 1.0;

  const maxLength = Math.max(s1.length, s2.length);
  if (maxLength === 0) return 1.0;

  const distance = levenshteinDistance(s1, s2);
  return 1 - distance / maxLength;
}

/**
 * Check if two transactions are duplicates
 * @param tx1 - First transaction
 * @param tx2 - Second transaction
 * @param options - Detection options
 * @returns true if transactions are duplicates
 */
export function isDuplicate(
  tx1: Transaction,
  tx2: Transaction,
  options: {
    dateTolerance?: number; // Days tolerance (default: 1)
    descriptionSimilarity?: number; // Minimum similarity threshold (default: 0.85)
  } = {},
): boolean {
  const { dateTolerance = 1, descriptionSimilarity = 0.85 } = options;

  // Check amount match (must be exact)
  if (tx1.amount !== tx2.amount) {
    return false;
  }

  // Check date match (within tolerance)
  const dateDiff = Math.abs(tx1.date.getTime() - tx2.date.getTime());
  const daysDiff = dateDiff / (1000 * 60 * 60 * 24);

  if (daysDiff > dateTolerance) {
    return false;
  }

  // Check description similarity
  const similarity = stringSimilarity(tx1.description, tx2.description);

  return similarity >= descriptionSimilarity;
}

/**
 * Find duplicates in a list of new transactions compared to existing ones
 * @param newTransactions - Transactions to check
 * @param existingTransactions - Already imported transactions
 * @returns Object with duplicates and unique transactions
 */
export function findDuplicates(
  newTransactions: Transaction[],
  existingTransactions: Transaction[],
): DuplicateDetectionResult {
  const unique: Transaction[] = [];
  const duplicates: Transaction[] = [];

  for (const newTx of newTransactions) {
    const hasDuplicate = existingTransactions.some((existingTx) => isDuplicate(newTx, existingTx));

    if (hasDuplicate) {
      duplicates.push(newTx);
    } else {
      unique.push(newTx);
    }
  }

  return { duplicates, unique };
}

/**
 * Calculate duplicate percentage
 * @param result - Duplicate detection result
 * @returns Percentage of duplicates (0-100)
 */
export function calculateDuplicatePercentage(result: DuplicateDetectionResult): number {
  const total = result.duplicates.length + result.unique.length;
  if (total === 0) return 0;

  return (result.duplicates.length / total) * 100;
}
