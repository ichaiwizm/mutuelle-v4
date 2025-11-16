/**
 * Transformateur pour les données du conjoint
 */

import type { Lead } from '../types';
import { mapProfession } from '../mappers/profession-mapper';
import { mapRegimeSocial } from '../mappers/regime-mapper';
import { requiresCadreExercice, getCadreExercice } from '../mappers/cadre-exercice-mapper';
import { transformBirthDate } from './date-transformer';
import { validateSpouseAge } from '../validators/age-validator';
import { parseDate } from './date-transformer';

/**
 * Transforme les données du conjoint (si présent)
 */
export function transformConjoint(lead: Lead) {
  const conjoint = lead.project?.conjoint;

  if (!conjoint || !conjoint.dateNaissance) {
    console.log('[CONJOINT] No conjoint data, skipping');
    return undefined;
  }

  console.log('[CONJOINT] Transforming conjoint data...');
  console.log('[CONJOINT] Input:', conjoint);

  // Valider l'âge
  const birthDate = parseDate(conjoint.dateNaissance);
  if (!birthDate || !validateSpouseAge(birthDate)) {
    throw new Error(`Conjoint age out of range (must be 18-110 years): ${conjoint.dateNaissance}`);
  }

  const profession = mapProfession(conjoint.profession as string);
  const regimeSocial = conjoint.regimeSocial as string;

  const transformed = {
    date_naissance: transformBirthDate(conjoint.dateNaissance),
    categorie_socioprofessionnelle: profession,
    ...(requiresCadreExercice(profession) && {
      cadre_exercice: getCadreExercice(regimeSocial),
    }),
    regime_obligatoire: mapRegimeSocial(regimeSocial),
  };

  console.log('[CONJOINT] Output:', transformed);

  return transformed;
}
