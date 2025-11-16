/**
 * Transformateur pour les données du souscripteur (adhérent)
 */

import type { Lead } from '../types';
import { mapCivilite } from '../mappers/civilite-mapper';
import { mapProfession } from '../mappers/profession-mapper';
import { mapRegimeSocial } from '../mappers/regime-mapper';
import { transformBirthDate } from './date-transformer';
import { validateSubscriberAge } from '../validators/age-validator';
import { parseDate } from './date-transformer';

/**
 * Transforme les données du souscripteur
 */
export function transformSubscriber(lead: Lead) {
  const subscriber = lead.subscriber;

  console.log('[SUBSCRIBER] Transforming subscriber data...');
  console.log('[SUBSCRIBER] Input:', {
    civilite: subscriber.civilite,
    nom: subscriber.nom,
    prenom: subscriber.prenom,
    dateNaissance: subscriber.dateNaissance,
    profession: subscriber.profession,
    regimeSocial: subscriber.regimeSocial,
    codePostal: subscriber.codePostal,
  });

  // Valider l'âge
  const birthDate = parseDate(subscriber.dateNaissance as string);
  if (!birthDate || !validateSubscriberAge(birthDate)) {
    throw new Error(`Subscriber age out of range (must be 18-110 years): ${subscriber.dateNaissance}`);
  }

  const transformed = {
    civilite: mapCivilite(subscriber.civilite as string),
    nom: subscriber.nom as string,
    prenom: subscriber.prenom as string,
    date_naissance: transformBirthDate(subscriber.dateNaissance as string),
    categorie_socioprofessionnelle: mapProfession(subscriber.profession as string),
    regime_obligatoire: mapRegimeSocial(subscriber.regimeSocial as string),
    code_postal: subscriber.codePostal as string,
  };

  console.log('[SUBSCRIBER] Output:', transformed);

  return transformed;
}
