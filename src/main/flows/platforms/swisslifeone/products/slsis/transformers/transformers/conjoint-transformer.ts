/**
 * Transformateur du conjoint pour SwissLifeOne
 */

import type { Lead } from '@/shared/types/lead';
import type { ConjointData } from '../types';
import { transformBirthDate, parseDate } from './date-transformer';
import { mapProfession } from '../mappers/profession-mapper';
import { mapRegimeSocial } from '../mappers/regime-mapper';
import { mapStatut } from '../mappers/statut-mapper';
import { validateSpouseAge } from '../validators/age-validator';
import { validateProfessionalDataCompatibility } from '../validators/compatibility-validator';

/**
 * Transforme les données du conjoint
 *
 * @param lead - Lead contenant les données conjoint
 * @returns Données formattées pour SwissLifeOne, ou undefined si pas de conjoint
 * @throws Error si âge invalide
 */
export function transformConjoint(lead: Lead): ConjointData | undefined {
  const conjoint = lead.project?.conjoint;

  // Pas de conjoint
  if (!conjoint || !conjoint.dateNaissance) {
    console.log('[CONJOINT] No conjoint data, skipping');
    return undefined;
  }

  console.log('[CONJOINT] Transforming conjoint data...');
  console.log('[CONJOINT] Input:', {
    dateNaissance: conjoint.dateNaissance,
    profession: conjoint.profession,
    regimeSocial: conjoint.regimeSocial,
    statut: conjoint.statut,
  });

  // 1. Valider et transformer la date de naissance
  const dateNaissance = transformBirthDate(conjoint.dateNaissance as string);

  // 2. Valider l'âge (16-99 ans pour SwissLife)
  const birthDate = parseDate(conjoint.dateNaissance as string);
  if (!birthDate || !validateSpouseAge(birthDate)) {
    throw new Error(
      `Conjoint age out of range (must be 16-99 years): ${conjoint.dateNaissance}`
    );
  }

  // 3. Mapper régime social
  const regimeSocial = mapRegimeSocial(conjoint.regimeSocial as string);

  // 4. Mapper profession (DYNAMIC après régime)
  const profession = mapProfession(conjoint.profession as string);

  // 5. Mapper statut (DYNAMIC après profession)
  const statut = mapStatut(conjoint.statut as string);

  // 6. Valider la compatibilité profession/régime/statut
  const compatibilityCheck = validateProfessionalDataCompatibility(profession, regimeSocial, statut);
  if (!compatibilityCheck.compatible) {
    console.warn(
      `[CONJOINT] ⚠️  Compatibility warning: ${compatibilityCheck.reason || 'Unknown incompatibility'}`
    );
  }

  const transformed = {
    date_naissance: dateNaissance,
    regime_social: regimeSocial,
    profession,
    statut,
  };

  console.log('[CONJOINT] Output:', transformed);

  return transformed;
}
