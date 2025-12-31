/**
 * Alptis platform civilite mappings
 */

import {
  MALE_ALIASES,
  FEMALE_ALIASES,
  AlptisSanteProPlusCivilite,
  AlptisSanteSelectCivilite,
  createCiviliteMapper,
} from './types';

/**
 * Alptis Sante Pro Plus civilite mappings (M/MME format)
 */
export const alptisSanteProPlusCiviliteMap: Record<string, AlptisSanteProPlusCivilite> = {
  ...Object.fromEntries(MALE_ALIASES.map((k) => [k, 'M' as const])),
  ...Object.fromEntries(FEMALE_ALIASES.map((k) => [k, 'MME' as const])),
};

/**
 * Alptis Sante Select civilite mappings (monsieur/madame format)
 */
export const alptisSanteSelectCiviliteMap: Record<string, AlptisSanteSelectCivilite> = {
  ...Object.fromEntries(MALE_ALIASES.map((k) => [k, 'monsieur' as const])),
  ...Object.fromEntries(FEMALE_ALIASES.map((k) => [k, 'madame' as const])),
};

/** Pre-built mappers for Alptis */
export const mapAlptisSanteProPlusCivilite = createCiviliteMapper(
  alptisSanteProPlusCiviliteMap,
  'M' as AlptisSanteProPlusCivilite
);

export const mapAlptisSanteSelectCivilite = createCiviliteMapper(
  alptisSanteSelectCiviliteMap,
  'monsieur' as AlptisSanteSelectCivilite
);
