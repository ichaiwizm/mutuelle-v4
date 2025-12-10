/**
 * Mapper pour le statut professionnel
 * NOUVEAU - Spécifique à Santé Pro Plus
 *
 * Ce champ apparaît UNIQUEMENT pour la profession "Chefs d'entreprise"
 * Options: Artisan-Commerçant / Professions libérales
 */

import type { AlptisProfession, AlptisStatutProfessionnel } from '../types';
import { PROFESSION_WITH_STATUT_PROFESSIONNEL } from '../types';

/**
 * Vérifie si une profession nécessite le champ "Statut professionnel"
 * Seulement "Chefs d'entreprise"
 */
export function requiresStatutProfessionnel(profession: AlptisProfession): boolean {
  return profession === PROFESSION_WITH_STATUT_PROFESSIONNEL;
}

/**
 * Détermine le statut professionnel basé sur la profession d'origine
 *
 * Logique:
 * - Si la profession contient "artisan" ou "commerçant" → Artisan-Commerçant
 * - Sinon → Professions libérales
 */
export function getStatutProfessionnel(professionOrigine: string | undefined): AlptisStatutProfessionnel {
  if (!professionOrigine) {
    console.warn('[STATUT_PROFESSIONNEL] Missing profession origine, defaulting to PROFESSIONS_LIBERALES');
    return 'PROFESSIONS_LIBERALES';
  }

  const normalized = professionOrigine.toLowerCase().trim();

  // Artisan ou commerçant
  if (
    normalized.includes('artisan') ||
    normalized.includes('commerçant') ||
    normalized.includes('commercant')
  ) {
    return 'ARTISAN_COMMERCANT';
  }

  // Par défaut: professions libérales
  return 'PROFESSIONS_LIBERALES';
}

/**
 * Labels pour l'affichage UI
 */
export const STATUT_PROFESSIONNEL_LABELS: Record<AlptisStatutProfessionnel, string> = {
  'ARTISAN_COMMERCANT': 'Artisan-Commerçant',
  'PROFESSIONS_LIBERALES': 'Professions libérales',
};
