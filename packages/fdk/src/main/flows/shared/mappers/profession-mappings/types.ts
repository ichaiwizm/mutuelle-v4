/**
 * Shared types and utilities for profession mappings
 */

/** Base profession mapping interface */
export interface ProfessionMapping {
  readonly input: string;
  readonly output: string;
  readonly platform?: string[];
}

/**
 * Normalized profession input keys
 * Lowercased and trimmed for consistent matching
 */
export function normalizeKey(key: string): string {
  return key.toLowerCase().trim();
}

/**
 * Create a profession mapper for a specific platform
 */
export function createProfessionMapper<T extends string>(
  mappings: Record<string, T>,
  defaultValue: T
): (profession: string | undefined) => T {
  return (profession: string | undefined): T => {
    if (!profession?.trim()) return defaultValue;
    const key = normalizeKey(profession);
    return mappings[key] ?? defaultValue;
  };
}
