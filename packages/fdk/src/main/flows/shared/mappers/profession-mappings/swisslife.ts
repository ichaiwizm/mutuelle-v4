/**
 * SwissLife platform profession mappings
 */

import { SWISSLIFE_PROFESSIONS } from './constants';
import { createProfessionMapper } from './types';

/**
 * SwissLife profession mappings
 */
export const swisslifeProfessionMap: Record<string, string> = {
  salarie: SWISSLIFE_PROFESSIONS.SALARIE,
  tns: SWISSLIFE_PROFESSIONS.TNS,
  sans_emploi: SWISSLIFE_PROFESSIONS.SANS_EMPLOI,
  retraite: SWISSLIFE_PROFESSIONS.RETRAITE,
  etudiant: SWISSLIFE_PROFESSIONS.ETUDIANT,
  // Common aliases
  artisan: SWISSLIFE_PROFESSIONS.TNS,
  commercant: SWISSLIFE_PROFESSIONS.TNS,
  liberal: SWISSLIFE_PROFESSIONS.TNS,
  'profession liberale': SWISSLIFE_PROFESSIONS.TNS,
};

/** Pre-built mapper for SwissLife */
export const mapSwisslifeProfession = createProfessionMapper(
  swisslifeProfessionMap,
  SWISSLIFE_PROFESSIONS.SALARIE
);
