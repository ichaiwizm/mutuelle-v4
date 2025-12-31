/**
 * Shared types and utilities for regime mappings
 */

/**
 * Normalize input key for consistent matching
 */
export function normalizeKey(key: string): string {
  return key.toLowerCase().trim();
}

/**
 * Create a regime mapper for a specific platform
 */
export function createRegimeMapper<T extends string>(
  mappings: Record<string, T>,
  defaultValue: T
): (regime: string | undefined) => T {
  return (regime: string | undefined): T => {
    if (!regime?.trim()) return defaultValue;
    const key = normalizeKey(regime);
    return mappings[key] ?? defaultValue;
  };
}

/**
 * Check if a regime is TNS/independant
 */
export function isTNSRegime(regime: string | undefined): boolean {
  if (!regime) return false;
  const key = normalizeKey(regime);
  return key.includes('tns') || key.includes('independant');
}

/**
 * Check if a regime is Alsace-Moselle
 */
export function isAlsaceMoselleRegime(regime: string | undefined): boolean {
  if (!regime) return false;
  const key = normalizeKey(regime);
  return key.includes('alsace') || key.includes('moselle');
}
