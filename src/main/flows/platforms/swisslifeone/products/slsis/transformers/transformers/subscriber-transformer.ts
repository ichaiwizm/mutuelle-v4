/**
 * Transformateur de l'assuré principal pour SwissLifeOne
 */

import type { Lead } from '@/shared/types/lead';
import type { AssurePrincipalData } from '../types';
import { transformBirthDate, parseDate } from './date-transformer';
import { extractDepartement } from '../utils/departement-extractor';
import { mapProfession } from '../mappers/profession-mapper';
import { mapRegimeSocial } from '../mappers/regime-mapper';
import { mapStatut } from '../mappers/statut-mapper';
import { validateSubscriberAge } from '../validators/age-validator';
import { validateProfessionalDataCompatibility } from '../validators/compatibility-validator';

/**
 * Transforme les données de l'assuré principal
 *
 * @param lead - Lead contenant les données subscriber
 * @returns Données formattées pour SwissLifeOne
 * @throws Error si âge invalide ou données manquantes
 */
export function transformSubscriber(lead: Lead): AssurePrincipalData {
  const subscriber = lead.subscriber;

  // 1. Valider et transformer la date de naissance
  const dateNaissance = transformBirthDate(subscriber.dateNaissance as string);

  // 2. Valider l'âge (18-110 ans)
  const birthDate = parseDate(subscriber.dateNaissance as string);
  if (!birthDate || !validateSubscriberAge(birthDate)) {
    throw new Error(
      `[SUBSCRIBER] Age out of range. Subscriber must be 18-110 years old. Birth date: ${subscriber.dateNaissance}`
    );
  }

  // 3. Extraire le département depuis le code postal
  const departementResidence = extractDepartement(subscriber.codePostal as string);

  // 4. Mapper régime social
  const regimeSocial = mapRegimeSocial(subscriber.regimeSocial as string);

  // 5. Mapper profession (DYNAMIC après régime)
  const profession = mapProfession(subscriber.profession as string);

  // 6. Mapper statut (DYNAMIC après profession)
  const statut = mapStatut(subscriber.statut as string);

  // 7. Valider la compatibilité profession/régime/statut
  const compatibilityCheck = validateProfessionalDataCompatibility(profession, regimeSocial, statut);
  if (!compatibilityCheck.compatible) {
    console.warn(
      `[SUBSCRIBER] Compatibility warning: ${compatibilityCheck.reason || 'Unknown incompatibility'}`
    );
  }

  return {
    date_naissance: dateNaissance,
    departement_residence: departementResidence,
    regime_social: regimeSocial,
    profession,
    statut,
  };
}
