/**
 * Profession mappings - aggregation module
 * Re-exports all profession mapping utilities
 */

// Types and utilities
export type { ProfessionMapping } from './types';
export { normalizeKey, createProfessionMapper } from './types';

// Constants
export {
  GENERIC_PROFESSIONS,
  ALPTIS_PROFESSIONS,
  SWISSLIFE_PROFESSIONS,
  ENTORIA_DEFAULT_PROFESSION,
  ENTORIA_COMMON_PROFESSIONS,
} from './constants';

// Alptis mappings
export {
  alptisSanteProPlusProfessionMap,
  alptisSanteSelectProfessionMap,
  mapAlptisSanteProPlusProfession,
  mapAlptisSanteSelectProfession,
} from './alptis';

// SwissLife mappings
export { swisslifeProfessionMap, mapSwisslifeProfession } from './swisslife';

// Entoria mappings
export { entoriaProfessionMap, mapEntoriaProfession } from './entoria';
