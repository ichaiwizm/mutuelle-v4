/**
 * Validateur d'éligibilité pour Santé Pro Plus
 *
 * DIFFÉRENCE MAJEURE avec Santé Select:
 * - Santé Select: éligible si âge >= 60 OU TNS
 * - Santé Pro Plus: éligible UNIQUEMENT si TNS (pas de critère d'âge)
 */

import type { Lead } from '@/shared/types/lead';
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
  if (!birthDate) {
    throw new Error(`Invalid date format: ${dateNaissance}`);
  }
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Vérifie si une personne est éligible comme adhérent principal selon les règles Santé Pro Plus:
 *
 * UNIQUEMENT éligible si: Régime TNS / Indépendant
 * (Pas de critère d'âge >= 60 comme dans Santé Select)
 */
export function isEligibleAsMainSubscriber(
  dateNaissance: string,
  profession: string,
  regimeSocial: string
): { eligible: boolean; reason: string } {
  // Critère UNIQUE : TNS / Indépendant
  const regimeLower = regimeSocial.toLowerCase();
  const isTNS = regimeLower.includes('tns') ||
                regimeLower.includes('indépendant') ||
                regimeLower.includes('independant');

  if (isTNS) {
    return {
      eligible: true,
      reason: `Éligible TNS (régime: ${regimeSocial})`
    };
  }

  // Non éligible (pas de critère d'âge pour Santé Pro Plus)
  const age = calculateAge(dateNaissance);
  return {
    eligible: false,
    reason: `Non éligible - Santé Pro Plus réservé aux TNS (régime actuel: ${regimeSocial}, âge: ${age} ans)`
  };
}

/**
 * Détermine l'éligibilité de l'adhérent et du conjoint, et si un swap est nécessaire
 */
export function determineEligibility(lead: Lead): EligibilityResult {
  // Vérifier l'éligibilité de l'adhérent principal
  const subscriberCheck = isEligibleAsMainSubscriber(
    lead.subscriber.dateNaissance || '',
    lead.subscriber.profession || '',
    lead.subscriber.regimeSocial || ''
  );

  // Vérifier l'éligibilité du conjoint s'il existe
  let conjointCheck: { eligible: boolean; reason: string } | null = null;

  if (lead.project?.conjoint?.dateNaissance) {
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
