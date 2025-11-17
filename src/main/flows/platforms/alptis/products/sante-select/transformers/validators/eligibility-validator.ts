import type { Lead } from '../../../../../types/lead.types';
import { parseDate } from '../transformers/date-transformer';

export interface EligibilityResult {
  subscriberEligible: boolean;
  conjointEligible: boolean;
  shouldSwap: boolean;
  subscriberReason?: string;
  conjointReason?: string;
}

/**
 * Calcule l'âge à partir d'une date de naissance au format DD/MM/YYYY
 */
export function calculateAge(dateNaissance: string): number {
  const birthDate = parseDate(dateNaissance);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Vérifie si une personne est éligible comme adhérent principal selon les règles Alptis Santé Select :
 *
 * Éligible si AU MOINS UN des critères suivants est rempli :
 * 1. Âge >= 60 ans
 * 2. Régime TNS / Indépendant
 * 3. Président de SASU/SAS (détecté via le régime social)
 */
export function isEligibleAsMainSubscriber(
  dateNaissance: string,
  profession: string,
  regimeSocial: string
): { eligible: boolean; reason: string } {
  const age = calculateAge(dateNaissance);

  // Critère 1 : Âge >= 60 ans
  if (age >= 60) {
    return {
      eligible: true,
      reason: `Éligible (âge: ${age} ans >= 60)`
    };
  }

  // Critère 2 et 3 : TNS / Indépendant / Président SASU/SAS
  const regimeLower = regimeSocial.toLowerCase();
  const isTNS = regimeLower.includes('tns') ||
                regimeLower.includes('indépendant') ||
                regimeLower.includes('independant');

  if (isTNS) {
    return {
      eligible: true,
      reason: `Éligible (régime: ${regimeSocial})`
    };
  }

  // Non éligible
  return {
    eligible: false,
    reason: `Non éligible (âge: ${age} ans < 60, régime: ${regimeSocial})`
  };
}

/**
 * Détermine l'éligibilité de l'adhérent et du conjoint, et si un swap est nécessaire
 */
export function determineEligibility(lead: Lead): EligibilityResult {
  // Vérifier l'éligibilité de l'adhérent principal
  const subscriberCheck = isEligibleAsMainSubscriber(
    lead.subscriber.dateNaissance,
    lead.subscriber.profession,
    lead.subscriber.regimeSocial
  );

  // Vérifier l'éligibilité du conjoint s'il existe
  let conjointCheck: { eligible: boolean; reason: string } | null = null;

  if (lead.project?.conjoint) {
    conjointCheck = isEligibleAsMainSubscriber(
      lead.project.conjoint.dateNaissance,
      lead.project.conjoint.profession || '',
      lead.project.conjoint.regimeSocial || ''
    );
  }

  // Déterminer si un swap est nécessaire
  const shouldSwap = !subscriberCheck.eligible &&
                     conjointCheck !== null &&
                     conjointCheck.eligible;

  return {
    subscriberEligible: subscriberCheck.eligible,
    conjointEligible: conjointCheck?.eligible || false,
    shouldSwap,
    subscriberReason: subscriberCheck.reason,
    conjointReason: conjointCheck?.reason,
  };
}
