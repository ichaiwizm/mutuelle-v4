/**
 * Shared civilite mapper for all FDK flows
 * Re-exports from civilite-mappings/ for backward compatibility
 */

export type { AlptisSanteProPlusCivilite, AlptisSanteSelectCivilite } from './civilite-mappings';

export {
  // Utilities
  normalizeKey,
  createCiviliteMapper,
  CIVILITE,
  MALE_ALIASES,
  FEMALE_ALIASES,
  // Alptis mappings
  alptisSanteProPlusCiviliteMap,
  alptisSanteSelectCiviliteMap,
  mapAlptisSanteProPlusCivilite,
  mapAlptisSanteSelectCivilite,
  // Utility functions
  isMale,
  isFemale,
  convertCivilite,
} from './civilite-mappings';
