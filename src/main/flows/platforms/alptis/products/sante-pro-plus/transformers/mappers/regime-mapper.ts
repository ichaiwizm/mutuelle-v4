/**
 * Mapper pour le régime social (régime obligatoire)
 * Identique à Santé Select
 */

import type { AlptisRegime } from '../types';

/**
 * Mapping table: AssurProspect → Alptis
 */
const REGIME_MAPPING: Record<string, AlptisRegime> = {
  'tns : régime des indépendants': 'SECURITE_SOCIALE_INDEPENDANTS',
  'tns': 'SECURITE_SOCIALE_INDEPENDANTS',
  'indépendant': 'SECURITE_SOCIALE_INDEPENDANTS',
  'régime des indépendants': 'SECURITE_SOCIALE_INDEPENDANTS',
  'salarié (ou retraité)': 'SECURITE_SOCIALE',
  'salarié': 'SECURITE_SOCIALE',
  'retraité': 'SECURITE_SOCIALE',
  'salarié exploitant agricole': 'REGIME_SALARIES_AGRICOLES',
  'exploitant agricole': 'REGIME_SALARIES_AGRICOLES',
  'alsace': 'ALSACE_MOSELLE',
  'moselle': 'ALSACE_MOSELLE',
  'amexa': 'AMEXA',
};

const DEFAULT_REGIME: AlptisRegime = 'SECURITE_SOCIALE';

/**
 * Map régime social from lead to Alptis format
 */
export function mapRegimeSocial(regimeSocial: string | undefined): AlptisRegime {
  if (!regimeSocial || regimeSocial.trim() === '') {
    console.warn('[REGIME] Missing régime social, using default:', DEFAULT_REGIME);
    return DEFAULT_REGIME;
  }

  // Normalize: lowercase + trim
  const normalized = regimeSocial.toLowerCase().trim();
  const mapped = REGIME_MAPPING[normalized];

  if (!mapped) {
    console.warn(`[REGIME] Unknown régime social: "${regimeSocial}", using default:`, DEFAULT_REGIME);
    return DEFAULT_REGIME;
  }

  return mapped;
}
