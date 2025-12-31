/**
 * Regime constants for all platforms
 */

/** Generic regime values (common input keys) */
export const GENERIC_REGIMES = {
  TNS: 'tns',
  SALARIE: 'salarie',
  GENERAL: 'general',
  ALSACE_MOSELLE: 'alsace_moselle',
  AGRICOLE: 'agricole',
  RETRAITE: 'retraite',
  INDEPENDANT: 'independant',
} as const;

/** Alptis Sante Pro Plus regime values */
export type AlptisSanteProPlusRegime = 'TNS' | 'SALARIE' | 'AUTRE';

/** Alptis Sante Select regime values */
export const ALPTIS_REGIMES = {
  ALSACE_MOSELLE: 'ALSACE_MOSELLE',
  AMEXA: 'AMEXA',
  SALARIES_AGRICOLES: 'REGIME_SALARIES_AGRICOLES',
  SECURITE_SOCIALE: 'SECURITE_SOCIALE',
  INDEPENDANTS: 'SECURITE_SOCIALE_INDEPENDANTS',
} as const;

export type AlptisSanteSelectRegime = (typeof ALPTIS_REGIMES)[keyof typeof ALPTIS_REGIMES];

/** SwissLife regime values */
export const SWISSLIFE_REGIMES = {
  GENERAL: 'regime_general',
  ALSACE_MOSELLE: 'alsace_moselle',
  TNS: 'tns',
} as const;

export type SwissLifeRegime = (typeof SWISSLIFE_REGIMES)[keyof typeof SWISSLIFE_REGIMES];
