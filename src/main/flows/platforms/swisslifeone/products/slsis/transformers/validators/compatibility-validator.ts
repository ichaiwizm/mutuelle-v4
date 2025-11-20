/**
 * Validateur de compatibilité pour SwissLifeOne
 * Vérifie que profession/régime et statut/profession sont cohérents
 */

import type { SwissLifeProfession, SwissLifeRegime, SwissLifeStatut, CompatibilityResult } from '../types';

/**
 * Vérifie la compatibilité entre profession et régime social
 *
 * Règles de bon sens (non exhaustif, peut nécessiter des ajustements):
 * - Professions médicales libérales peuvent être TNS
 * - Non médicales peuvent être avec tout régime
 *
 * @param profession - Profession SwissLife
 * @param regime - Régime social SwissLife
 * @returns Résultat de compatibilité
 */
export function validateProfessionRegimeCompatibility(
  profession: SwissLifeProfession,
  regime: SwissLifeRegime
): CompatibilityResult {
  // Pour l'instant, toutes les combinaisons sont acceptées avec warnings si suspicieux

  // Cas suspects (non bloquants)
  const warnings: string[] = [];

  // Professions médicales avec MSA (peu probable)
  if (
    (profession === 'MEDECIN' || profession === 'CHIRURGIEN' || profession === 'CHIRURGIEN_DENTISTE' || profession === 'PHARMACIEN') &&
    regime === 'MSA_AMEXA'
  ) {
    warnings.push(`Unusual: ${profession} with MSA regime (usually non-agricultural)`);
  }

  // Log warnings mais accepte la compatibilité
  if (warnings.length > 0) {
    console.warn(`[COMPATIBILITY] Profession/Regime: ${warnings.join(', ')}`);
  }

  return {
    compatible: true, // Graceful: accepter mais logger
    reason: warnings.length > 0 ? warnings.join('; ') : undefined,
  };
}

/**
 * Vérifie la compatibilité entre statut et profession
 *
 * Règles de bon sens (non exhaustif):
 * - Etudiant incompatible avec professions établies (médecins, etc.)
 * - Fonctionnaire compatible avec professions médicales hospitalières
 *
 * @param statut - Statut professionnel SwissLife
 * @param profession - Profession SwissLife
 * @returns Résultat de compatibilité
 */
export function validateStatutProfessionCompatibility(
  statut: SwissLifeStatut,
  profession: SwissLifeProfession
): CompatibilityResult {
  // Pour l'instant, toutes les combinaisons sont acceptées avec warnings si suspicieux

  const warnings: string[] = [];

  // Etudiant avec profession établie (suspect)
  if (
    statut === 'ETUDIANT' &&
    (profession === 'MEDECIN' || profession === 'CHIRURGIEN' || profession === 'PHARMACIEN')
  ) {
    warnings.push(`Unusual: Student (ETUDIANT) with established profession (${profession})`);
  }

  // Log warnings mais accepte la compatibilité
  if (warnings.length > 0) {
    console.warn(`[COMPATIBILITY] Statut/Profession: ${warnings.join(', ')}`);
  }

  return {
    compatible: true, // Graceful: accepter mais logger
    reason: warnings.length > 0 ? warnings.join('; ') : undefined,
  };
}

/**
 * Vérifie la compatibilité globale des données professionnelles
 *
 * @param profession - Profession SwissLife
 * @param regime - Régime social SwissLife
 * @param statut - Statut professionnel SwissLife
 * @returns Résultat de compatibilité global
 */
export function validateProfessionalDataCompatibility(
  profession: SwissLifeProfession,
  regime: SwissLifeRegime,
  statut: SwissLifeStatut
): CompatibilityResult {
  const professionRegimeCheck = validateProfessionRegimeCompatibility(profession, regime);
  const statutProfessionCheck = validateStatutProfessionCompatibility(statut, profession);

  const allReasons: string[] = [];
  if (professionRegimeCheck.reason) allReasons.push(professionRegimeCheck.reason);
  if (statutProfessionCheck.reason) allReasons.push(statutProfessionCheck.reason);

  return {
    compatible: professionRegimeCheck.compatible && statutProfessionCheck.compatible,
    reason: allReasons.length > 0 ? allReasons.join('; ') : undefined,
  };
}
