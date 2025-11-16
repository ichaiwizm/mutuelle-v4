/**
 * Mapper pour le cadre d'exercice (conditionnel)
 */

import type { AlptisProfession, AlptisCadreExercice } from '../types';

/**
 * Professions qui nécessitent le champ "Cadre d'exercice"
 *
 * Basé sur les tests effectués sur le formulaire Alptis:
 * - Ces professions peuvent exercer soit en tant que salarié
 * - Soit en tant qu'indépendant/président SASU/SAS
 */
const PROFESSIONS_WITH_CADRE_EXERCICE: AlptisProfession[] = [
  'AGRICULTEURS_EXPLOITANTS',
  'ARTISANS',
  'CHEFS_D_ENTREPRISE',
  'COMMERCANTS_ET_ASSIMILES',
  'PROFESSIONS_LIBERALES_ET_ASSIMILES',
];

/**
 * Vérifie si une profession nécessite le champ "Cadre d'exercice"
 */
export function requiresCadreExercice(profession: AlptisProfession): boolean {
  return PROFESSIONS_WITH_CADRE_EXERCICE.includes(profession);
}

/**
 * Détermine le cadre d'exercice basé sur le régime social
 *
 * Logique:
 * - TNS/Indépendants → Indépendant Président SASU/SAS
 * - Salarié/Autres → Salarié
 */
export function getCadreExercice(regimeSocial: string | undefined): AlptisCadreExercice {
  if (!regimeSocial) {
    console.warn('[CADRE_EXERCICE] Missing régime social, defaulting to SALARIE');
    return 'SALARIE';
  }

  const normalized = regimeSocial.toLowerCase().trim();

  // TNS ou indépendants
  if (
    normalized.includes('tns') ||
    normalized.includes('indépendant') ||
    normalized.includes('independant')
  ) {
    return 'INDEPENDANT_PRESIDENT_SASU_SAS';
  }

  // Par défaut: salarié
  return 'SALARIE';
}
