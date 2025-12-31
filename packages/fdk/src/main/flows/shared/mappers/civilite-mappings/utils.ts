/**
 * Civilite utility functions
 */

import { normalizeKey, MALE_ALIASES, FEMALE_ALIASES } from './types';

/**
 * Check if civilite is male
 */
export function isMale(civilite: string | undefined): boolean {
  if (!civilite) return false;
  return MALE_ALIASES.includes(normalizeKey(civilite));
}

/**
 * Check if civilite is female
 */
export function isFemale(civilite: string | undefined): boolean {
  if (!civilite) return false;
  return FEMALE_ALIASES.includes(normalizeKey(civilite));
}

/**
 * Convert civilite from one format to another
 */
export function convertCivilite(
  civilite: string | undefined,
  targetFormat: 'short' | 'long'
): string {
  if (!civilite) return targetFormat === 'short' ? 'M' : 'monsieur';
  const isMaleValue = isMale(civilite);
  if (targetFormat === 'short') {
    return isMaleValue ? 'M' : 'MME';
  }
  return isMaleValue ? 'monsieur' : 'madame';
}
