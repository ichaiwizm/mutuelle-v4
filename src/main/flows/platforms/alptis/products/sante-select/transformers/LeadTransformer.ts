import type { Lead } from '@/shared/types/lead';

/**
 * Transformateur de lead POC
 *
 * Pour l'instant, transformation simple :
 * - Ajoute un chiffre aléatoire (0-9) à la fin du prénom
 *
 * Exemple :
 *   Input:  { subscriber: { prenom: "emilie" } }
 *   Output: { subscriber: { prenom: "emilie7" } }
 */

export class LeadTransformer {
  /**
   * Transforme un lead en ajoutant un chiffre aléatoire au prénom
   */
  static transform(lead: Lead): Lead {
    const randomDigit = Math.floor(Math.random() * 10);
    const prenom = lead.subscriber.prenom as string;

    return {
      ...lead,
      subscriber: {
        ...lead.subscriber,
        prenom: `${prenom}${randomDigit}`,
      },
    };
  }
}
