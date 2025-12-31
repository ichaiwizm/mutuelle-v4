/**
 * Shared types and utilities for civilite mappings
 */

/**
 * Normalize input key for consistent matching
 */
export function normalizeKey(key: string): string {
  return key.toLowerCase().trim();
}

/** Standard civilite values */
export const CIVILITE = {
  MONSIEUR: 'monsieur',
  MADAME: 'madame',
  M: 'M',
  MME: 'MME',
} as const;

/** Civilite type for Alptis Sante Pro Plus */
export type AlptisSanteProPlusCivilite = 'M' | 'MME';

/** Civilite type for Alptis Sante Select */
export type AlptisSanteSelectCivilite = 'monsieur' | 'madame';

/**
 * Create a civilite mapper for a specific platform
 */
export function createCiviliteMapper<T extends string>(
  mappings: Record<string, T>,
  defaultValue: T
): (civilite: string | undefined) => T {
  return (civilite: string | undefined): T => {
    if (!civilite?.trim()) return defaultValue;
    const key = normalizeKey(civilite);
    return mappings[key] ?? defaultValue;
  };
}

/**
 * Common input aliases for civilite
 */
export const MALE_ALIASES = ['m', 'mr', 'monsieur', 'homme', 'h', 'male', 'masculin'];
export const FEMALE_ALIASES = ['mme', 'madame', 'femme', 'f', 'mlle', 'mademoiselle', 'female', 'feminin'];
