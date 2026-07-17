/**
 * Unicode-aware name normalization: trim and collapse internal whitespace.
 * Preserves letter case and scripts (Armenian, Latin, Cyrillic).
 */
export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/gu, ' ');
}

/**
 * Trim and lowercase the full email for uniqueness/search storage.
 */
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Trim display email without lowercasing (for communication).
 */
export function trimEmail(value: string): string {
  return value.trim();
}
