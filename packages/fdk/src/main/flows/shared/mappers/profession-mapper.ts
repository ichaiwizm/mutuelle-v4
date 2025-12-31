/**
 * Shared profession mapper for all FDK flows
 * Re-exports from profession-mappings/ for backward compatibility
 */

export type { ProfessionMapping } from './profession-mappings';

export {
  // Utilities
  normalizeKey,
  createProfessionMapper,
  // Constants
  GENERIC_PROFESSIONS,
  ALPTIS_PROFESSIONS,
  SWISSLIFE_PROFESSIONS,
  ENTORIA_DEFAULT_PROFESSION,
  ENTORIA_COMMON_PROFESSIONS,
  // Alptis
  alptisSanteProPlusProfessionMap,
  alptisSanteSelectProfessionMap,
  mapAlptisSanteProPlusProfession,
  mapAlptisSanteSelectProfession,
  // SwissLife
  swisslifeProfessionMap,
  mapSwisslifeProfession,
  // Entoria
  entoriaProfessionMap,
  mapEntoriaProfession,
} from './profession-mappings';
