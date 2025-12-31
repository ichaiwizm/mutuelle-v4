/**
 * Alptis platform profession mappings
 */

import { ALPTIS_PROFESSIONS } from './constants';
import { createProfessionMapper } from './types';

/**
 * Alptis (Sante Pro Plus) profession mappings
 */
export const alptisSanteProPlusProfessionMap: Record<string, string> = {
  artisan: 'ARTISAN',
  commercant: 'COMMERCANT',
  liberal: 'PROFESSION_LIBERALE',
  'profession liberale': 'PROFESSION_LIBERALE',
  agriculteur: 'AGRICULTEUR',
};

/**
 * Alptis (Sante Select) profession mappings - extended version
 */
export const alptisSanteSelectProfessionMap: Record<string, string> = {
  'profession liberale': ALPTIS_PROFESSIONS.LIBERALES,
  "chef d'entreprise": ALPTIS_PROFESSIONS.CHEFS_ENTREPRISE,
  commercant: ALPTIS_PROFESSIONS.COMMERCANTS,
  artisan: ALPTIS_PROFESSIONS.ARTISANS,
  salarie: ALPTIS_PROFESSIONS.EMPLOYES,
  retraite: ALPTIS_PROFESSIONS.RETRAITES,
  'exploitant agricole': ALPTIS_PROFESSIONS.AGRICULTEURS_EXPLOITANTS,
  "en recherche d'emploi": ALPTIS_PROFESSIONS.SANS_ACTIVITE,
  'sans activite': ALPTIS_PROFESSIONS.SANS_ACTIVITE,
  cadre: ALPTIS_PROFESSIONS.CADRES,
  ouvrier: ALPTIS_PROFESSIONS.OUVRIERS,
  'fonction publique': ALPTIS_PROFESSIONS.CADRES_FONCTION_PUBLIQUE,
};

/** Pre-built mappers for Alptis */
export const mapAlptisSanteProPlusProfession = createProfessionMapper(
  alptisSanteProPlusProfessionMap,
  'PROFESSION_LIBERALE'
);

export const mapAlptisSanteSelectProfession = createProfessionMapper(
  alptisSanteSelectProfessionMap,
  ALPTIS_PROFESSIONS.LIBERALES
);
