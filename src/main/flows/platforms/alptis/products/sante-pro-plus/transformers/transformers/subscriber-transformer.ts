/**
 * Transformateur pour les données du souscripteur (adhérent)
 * Adapté pour Santé Pro Plus avec:
 * - micro_entrepreneur (toujours 'Non')
 * - ville (sera remplie automatiquement par le formulaire via code postal)
 * - statut_professionnel (conditionnel pour Chefs d'entreprise)
 */

import type { Lead } from '../types';
import { mapCivilite } from '../mappers/civilite-mapper';
import { mapProfession } from '../mappers/profession-mapper';
import { mapRegimeSocial } from '../mappers/regime-mapper';
import { requiresCadreExercice, getCadreExercice } from '../mappers/cadre-exercice-mapper';
import { requiresStatutProfessionnel, getStatutProfessionnel } from '../mappers/statut-professionnel-mapper';
import { transformBirthDate } from './date-transformer';
import { validateSubscriberAge } from '../validators/age-validator';
import { parseDate } from './date-transformer';

/**
 * Transforme les données du souscripteur
 */
export function transformSubscriber(lead: Lead) {
  const subscriber = lead.subscriber;

  console.log('[SUBSCRIBER] Transforming subscriber data for Santé Pro Plus...');
  console.log('[SUBSCRIBER] Input:', {
    civilite: subscriber.civilite,
    nom: subscriber.nom,
    prenom: subscriber.prenom,
    dateNaissance: subscriber.dateNaissance,
    profession: subscriber.profession,
    regimeSocial: subscriber.regimeSocial,
    codePostal: subscriber.codePostal,
  });

  // Valider l'âge (18-67 pour Santé Pro Plus)
  const birthDate = parseDate(subscriber.dateNaissance as string);
  if (!birthDate || !validateSubscriberAge(birthDate)) {
    throw new Error(`Subscriber age out of range (must be 18-67 years for Santé Pro Plus): ${subscriber.dateNaissance}`);
  }

  const profession = mapProfession(subscriber.profession as string);
  const regimeSocial = subscriber.regimeSocial as string;
  const professionOrigine = subscriber.profession as string;

  const transformed = {
    civilite: mapCivilite(subscriber.civilite as string),
    nom: subscriber.nom as string,
    prenom: subscriber.prenom as string,
    date_naissance: transformBirthDate(subscriber.dateNaissance as string),
    categorie_socioprofessionnelle: profession,
    micro_entrepreneur: 'Non' as const, // Toujours 'Non' par défaut
    ...(requiresCadreExercice(profession) && {
      cadre_exercice: getCadreExercice(regimeSocial),
    }),
    ...(requiresStatutProfessionnel(profession) && {
      statut_professionnel: getStatutProfessionnel(professionOrigine),
    }),
    regime_obligatoire: mapRegimeSocial(regimeSocial),
    code_postal: subscriber.codePostal as string,
    ville: '', // Sera rempli automatiquement par le formulaire via le code postal
  };

  console.log('[SUBSCRIBER] Output:', transformed);

  return transformed;
}
