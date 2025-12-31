/**
 * Shared regime mapper for all FDK flows
 * Re-exports from regime-mappings/ for backward compatibility
 */

export type {
  AlptisSanteProPlusRegime,
  AlptisSanteSelectRegime,
  SwissLifeRegime,
} from './regime-mappings';

export {
  // Utilities
  normalizeKey,
  createRegimeMapper,
  isTNSRegime,
  isAlsaceMoselleRegime,
  // Constants
  GENERIC_REGIMES,
  ALPTIS_REGIMES,
  SWISSLIFE_REGIMES,
  // Alptis
  alptisSanteProPlusRegimeMap,
  alptisSanteSelectRegimeMap,
  mapAlptisSanteProPlusRegime,
  mapAlptisSanteSelectRegime,
  // SwissLife
  swisslifeRegimeMap,
  mapSwisslifeRegime,
} from './regime-mappings';
