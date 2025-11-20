/**
 * Transformateur des enfants pour SwissLifeOne
 * Gère le champ spécifique ayantDroit (rattachement à l'assuré principal ou au conjoint)
 */

import type { Lead } from '@/shared/types/lead';
import type { EnfantsData, AyantDroit } from '../types';
import { transformBirthDate, parseDate } from './date-transformer';
import { validateChildAge } from '../validators/age-validator';
import { validateDateFormat } from '../validators/format-validator';

/**
 * Transforme les données des enfants
 *
 * @param lead - Lead contenant les données children
 * @returns Données formattées pour SwissLifeOne, ou undefined si pas d'enfants
 */
export function transformChildren(lead: Lead): EnfantsData | undefined {
  const children = lead.children;

  // Pas d'enfants
  if (!children || children.length === 0) {
    console.log('[CHILDREN] No children data, skipping');
    return undefined;
  }

  console.log('[CHILDREN] Transforming children data...');
  console.log(`[CHILDREN] Input: ${children.length} children`);

  // Déterminer si le conjoint existe (pour ayantDroit)
  const hasConjoint = !!lead.project?.conjoint;

  // Transformer et filtrer les enfants valides
  const validChildren = children
    .map((child, index) => {
      const childDateNaissance = child.dateNaissance as string;
      console.log(`[CHILDREN] Child ${index + 1}:`, { dateNaissance: childDateNaissance, ayantDroit: child.ayantDroit });

      // Vérifier le format de date
      if (!validateDateFormat(childDateNaissance)) {
        console.warn(
          `[CHILDREN] ⚠️  Child ${index + 1} has invalid date format: "${childDateNaissance}", skipping`
        );
        return null;
      }

      // Parser la date
      const birthDate = parseDate(childDateNaissance);
      if (!birthDate) {
        console.warn(`[CHILDREN] ⚠️  Child ${index + 1} has unparseable date: "${childDateNaissance}", skipping`);
        return null;
      }

      // Vérifier l'âge (0-27 ans)
      if (!validateChildAge(birthDate)) {
        console.warn(
          `[CHILDREN] ⚠️  Child ${index + 1} age out of range (must be 0-27 years): "${childDateNaissance}", skipping`
        );
        return null;
      }

      // Déterminer ayantDroit
      // 1. Si explicitement fourni dans le lead, l'utiliser
      // 2. Sinon, default = ASSURE_PRINCIPAL
      let ayantDroit: AyantDroit = 'ASSURE_PRINCIPAL';

      if (child.ayantDroit) {
        const ayantDroitValue = String(child.ayantDroit).toUpperCase();
        if (ayantDroitValue === 'CONJOINT' && hasConjoint) {
          ayantDroit = 'CONJOINT';
        } else if (ayantDroitValue === 'ASSURE_PRINCIPAL' || ayantDroitValue === 'PRINCIPAL') {
          ayantDroit = 'ASSURE_PRINCIPAL';
        }
      }

      return {
        date_naissance: transformBirthDate(childDateNaissance),
        ayant_droit: ayantDroit,
      };
    })
    .filter((child): child is NonNullable<typeof child> => child !== null);

  // Si aucun enfant valide, retourner undefined
  if (validChildren.length === 0) {
    console.log('[CHILDREN] No valid children after validation, skipping');
    return undefined;
  }

  console.log(`[CHILDREN] Output: ${validChildren.length} valid children`);

  return {
    nombre_enfants: validChildren.length,
    liste: validChildren,
  };
}
