/**
 * Regime mappings - aggregation module
 * Re-exports all regime mapping utilities
 */

// Types and utilities
export { normalizeKey, createRegimeMapper, isTNSRegime, isAlsaceMoselleRegime } from './types';

// Constants
export type { AlptisSanteProPlusRegime, AlptisSanteSelectRegime, SwissLifeRegime } from './constants';
export { GENERIC_REGIMES, ALPTIS_REGIMES, SWISSLIFE_REGIMES } from './constants';

// Alptis mappings
export {
  alptisSanteProPlusRegimeMap,
  alptisSanteSelectRegimeMap,
  mapAlptisSanteProPlusRegime,
  mapAlptisSanteSelectRegime,
} from './alptis';

// SwissLife mappings
export { swisslifeRegimeMap, mapSwisslifeRegime } from './swisslife';
