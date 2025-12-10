/**
 * Mapper pour le cadre d'exercice (conditionnel)
 * Identique à Santé Select pour l'adhérent
 * Note: Le conjoint n'a PAS de cadre d'exercice dans Santé Pro Plus
 */

import type { AlptisProfession, AlptisCadreExercice } from '../types';
import { PROFESSIONS_WITH_CADRE_EXERCICE } from '../types';

/**
 * Vérifie si une profession nécessite le champ "Cadre d'exercice"
 * Mêmes 5 professions que Santé Select
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
