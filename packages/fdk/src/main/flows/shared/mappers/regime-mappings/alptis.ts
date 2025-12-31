/**
 * Alptis platform regime mappings
 */

import { ALPTIS_REGIMES, AlptisSanteProPlusRegime, AlptisSanteSelectRegime } from './constants';
import { createRegimeMapper } from './types';

/**
 * Alptis Sante Pro Plus regime mappings
 */
export const alptisSanteProPlusRegimeMap: Record<string, AlptisSanteProPlusRegime> = {
  tns: 'TNS',
  salarie: 'SALARIE',
  autre: 'AUTRE',
  independant: 'TNS',
  'regime des independants': 'TNS',
};

/**
 * Alptis Sante Select regime mappings - extended version
 */
export const alptisSanteSelectRegimeMap: Record<string, AlptisSanteSelectRegime> = {
  'tns : regime des independants': ALPTIS_REGIMES.INDEPENDANTS,
  tns: ALPTIS_REGIMES.INDEPENDANTS,
  independant: ALPTIS_REGIMES.INDEPENDANTS,
  'regime des independants': ALPTIS_REGIMES.INDEPENDANTS,
  'salarie (ou retraite)': ALPTIS_REGIMES.SECURITE_SOCIALE,
  salarie: ALPTIS_REGIMES.SECURITE_SOCIALE,
  retraite: ALPTIS_REGIMES.SECURITE_SOCIALE,
  'salarie exploitant agricole': ALPTIS_REGIMES.SALARIES_AGRICOLES,
  'exploitant agricole': ALPTIS_REGIMES.SALARIES_AGRICOLES,
  alsace: ALPTIS_REGIMES.ALSACE_MOSELLE,
  moselle: ALPTIS_REGIMES.ALSACE_MOSELLE,
  'alsace moselle': ALPTIS_REGIMES.ALSACE_MOSELLE,
  alsace_moselle: ALPTIS_REGIMES.ALSACE_MOSELLE,
  amexa: ALPTIS_REGIMES.AMEXA,
};

/** Pre-built mappers for Alptis */
export const mapAlptisSanteProPlusRegime = createRegimeMapper(
  alptisSanteProPlusRegimeMap,
  'TNS' as AlptisSanteProPlusRegime
);

export const mapAlptisSanteSelectRegime = createRegimeMapper(
  alptisSanteSelectRegimeMap,
  ALPTIS_REGIMES.INDEPENDANTS
);
