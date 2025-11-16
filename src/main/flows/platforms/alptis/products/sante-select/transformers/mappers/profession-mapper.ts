/**
 * Mapper pour la profession (catégorie socioprofessionnelle)
 */

import type { AlptisProfession } from '../types';

/**
 * Mapping table: AssurProspect → Alptis
 */
const PROFESSION_MAPPING: Record<string, AlptisProfession> = {
  'profession libérale': 'PROFESSIONS_LIBERALES_ET_ASSIMILES',
  "chef d'entreprise": 'CHEFS_D_ENTREPRISE',
  'commerçant': 'COMMERCANTS_ET_ASSIMILES',
  'artisan': 'ARTISANS',
  'salarié': 'EMPLOYES_AGENTS_DE_MAITRISE',
  'retraité': 'RETRAITES',
  'exploitant agricole': 'AGRICULTEURS_EXPLOITANTS',
  "en recherche d'emploi": 'PERSONNES_SANS_ACTIVITE_PROFESSIONNELLE',
  'sans activité': 'PERSONNES_SANS_ACTIVITE_PROFESSIONNELLE',
  'cadre': 'CADRES',
  'ouvrier': 'OUVRIERS',
  'fonction publique': 'CADRES_ET_EMPLOYES_DE_LA_FONCTION_PUBLIQUE',
};

const DEFAULT_PROFESSION: AlptisProfession = 'PERSONNES_SANS_ACTIVITE_PROFESSIONNELLE';

/**
 * Map profession from lead to Alptis format
 */
export function mapProfession(profession: string | undefined): AlptisProfession {
  if (!profession || profession.trim() === '') {
    console.warn('[PROFESSION] Missing profession, using default:', DEFAULT_PROFESSION);
    return DEFAULT_PROFESSION;
  }

  // Normalize: lowercase + trim
  const normalized = profession.toLowerCase().trim();
  const mapped = PROFESSION_MAPPING[normalized];

  if (!mapped) {
    console.warn(`[PROFESSION] Unknown profession: "${profession}", using default:`, DEFAULT_PROFESSION);
    return DEFAULT_PROFESSION;
  }

  return mapped;
}
