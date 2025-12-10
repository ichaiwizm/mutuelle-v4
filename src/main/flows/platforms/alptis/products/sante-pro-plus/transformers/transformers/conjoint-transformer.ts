/**
 * Transformateur pour les données du conjoint
 * Adapté pour Santé Pro Plus:
 * - PAS de cadre_exercice (contrairement à Santé Select)
 * - PAS de micro_entrepreneur
 * - PAS de ville
 */

import type { Lead } from '../types';
import { mapProfession } from '../mappers/profession-mapper';
import { mapRegimeSocial } from '../mappers/regime-mapper';
import { transformBirthDate } from './date-transformer';
import { validateSpouseAge } from '../validators/age-validator';
import { parseDate } from './date-transformer';

/**
 * Transforme les données du conjoint (si présent)
 * Note: Dans Santé Pro Plus, le conjoint n'a PAS de cadre_exercice
 */
export function transformConjoint(lead: Lead) {
  const conjoint = lead.project?.conjoint;

  if (!conjoint || !conjoint.dateNaissance) {
    console.log('[CONJOINT] No conjoint data, skipping');
    return undefined;
  }

  console.log('[CONJOINT] Transforming conjoint data for Santé Pro Plus...');
  console.log('[CONJOINT] Input:', conjoint);

  // Valider l'âge (18-67 pour Santé Pro Plus)
  const birthDate = parseDate(conjoint.dateNaissance);
  if (!birthDate || !validateSpouseAge(birthDate)) {
    throw new Error(`Conjoint age out of range (must be 18-67 years for Santé Pro Plus): ${conjoint.dateNaissance}`);
  }

  const profession = mapProfession(conjoint.profession as string);
  const regimeSocial = conjoint.regimeSocial as string;

  // DIFFÉRENCE avec Santé Select: PAS de cadre_exercice pour le conjoint
  const transformed = {
    date_naissance: transformBirthDate(conjoint.dateNaissance),
    categorie_socioprofessionnelle: profession,
    regime_obligatoire: mapRegimeSocial(regimeSocial),
    // PAS de cadre_exercice dans Santé Pro Plus pour le conjoint
  };

  console.log('[CONJOINT] Output:', transformed);

  return transformed;
}
