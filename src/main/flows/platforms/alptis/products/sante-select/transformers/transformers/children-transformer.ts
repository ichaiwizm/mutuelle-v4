/**
 * Transformateur pour les données des enfants
 */

import type { Lead, AlptisRegime } from '../types';
import { transformBirthDate, parseDate } from './date-transformer';
import { validateChildAge } from '../validators/age-validator';
import { mapRegimeSocial } from '../mappers/regime-mapper';

/**
 * Transforme les données des enfants (si présents)
 */
export function transformChildren(lead: Lead, subscriberRegime: AlptisRegime) {
  const children = lead.children;

  if (!children || children.length === 0) {
    console.log('[CHILDREN] No children data, skipping');
    return undefined;
  }

  console.log('[CHILDREN] Transforming children data...');
  console.log(`[CHILDREN] Input: ${children.length} children`);

  const transformed = children
    .map((child, index) => {
      console.log(`[CHILDREN] Child ${index + 1}:`, child);

      // Vérifier que la date de naissance est présente
      if (!child.dateNaissance) {
        console.warn(`[CHILDREN] Missing birth date for child ${index + 1}, skipping`);
        return null;
      }

      // Valider l'âge
      const birthDate = parseDate(child.dateNaissance);
      if (!birthDate) {
        console.warn(`[CHILDREN] Invalid birth date format for child ${index + 1}: ${child.dateNaissance}, skipping`);
        return null;
      }

      if (!validateChildAge(birthDate)) {
        console.warn(`[CHILDREN] Child ${index + 1} age out of range (0-27 years): ${child.dateNaissance}, skipping`);
        return null;
      }

      return {
        date_naissance: transformBirthDate(child.dateNaissance),
        regime_obligatoire: subscriberRegime, // Hérité du souscripteur
      };
    })
    .filter((child): child is NonNullable<typeof child> => child !== null);

  if (transformed.length === 0) {
    console.log('[CHILDREN] No valid children after validation, skipping');
    return undefined;
  }

  console.log(`[CHILDREN] Output: ${transformed.length} valid children`);

  return transformed;
}
