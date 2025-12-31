/**
 * Civilite mappings - aggregation module
 * Re-exports all civilite mapping utilities
 */

// Types and utilities
export type { AlptisSanteProPlusCivilite, AlptisSanteSelectCivilite } from './types';
export { normalizeKey, createCiviliteMapper, CIVILITE, MALE_ALIASES, FEMALE_ALIASES } from './types';

// Alptis mappings
export {
  alptisSanteProPlusCiviliteMap,
  alptisSanteSelectCiviliteMap,
  mapAlptisSanteProPlusCivilite,
  mapAlptisSanteSelectCivilite,
} from './alptis';

// Utility functions
export { isMale, isFemale, convertCivilite } from './utils';
