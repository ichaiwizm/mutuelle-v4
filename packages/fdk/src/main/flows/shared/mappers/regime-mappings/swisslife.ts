/**
 * SwissLife platform regime mappings
 */

import { SWISSLIFE_REGIMES, SwissLifeRegime } from './constants';
import { createRegimeMapper } from './types';

/**
 * SwissLife regime mappings
 */
export const swisslifeRegimeMap: Record<string, SwissLifeRegime> = {
  general: SWISSLIFE_REGIMES.GENERAL,
  'regime general': SWISSLIFE_REGIMES.GENERAL,
  salarie: SWISSLIFE_REGIMES.GENERAL,
  alsace_moselle: SWISSLIFE_REGIMES.ALSACE_MOSELLE,
  alsace: SWISSLIFE_REGIMES.ALSACE_MOSELLE,
  moselle: SWISSLIFE_REGIMES.ALSACE_MOSELLE,
  'alsace moselle': SWISSLIFE_REGIMES.ALSACE_MOSELLE,
  tns: SWISSLIFE_REGIMES.TNS,
  independant: SWISSLIFE_REGIMES.TNS,
  'regime des independants': SWISSLIFE_REGIMES.TNS,
};

/** Pre-built mapper for SwissLife */
export const mapSwisslifeRegime = createRegimeMapper(
  swisslifeRegimeMap,
  SWISSLIFE_REGIMES.GENERAL
);
