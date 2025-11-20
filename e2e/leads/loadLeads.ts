import { parseLeads } from '@/main/leads/parsing/parser';
import type { Lead } from '@/shared/types/lead';

/**
 * Structure d'un email fixture
 */
type EmailFixture = {
  id: string;
  subject: string;
  from: string;
  date: number;
  text: string;
};

/**
 * Charge tous les leads depuis les fixtures emails en utilisant le parser existant
 * Utilise parseLeads() pour gérer les emails avec plusieurs fiches
 */
export function loadAllLeads(): Lead[] {
  const leads: Lead[] = [];

  // Charger les 15 fichiers email-001.json à email-015.json
  for (let i = 1; i <= 15; i++) {
    const filename = `email-${String(i).padStart(3, '0')}.json`;

    try {
      // Import dynamique du fichier JSON
      const email = require(`../../src/main/__tests__/fixtures/emails/${filename}`) as EmailFixture;

      // Utiliser parseLeads() qui gère les emails avec plusieurs fiches
      const parsedLeads = parseLeads(
        { text: email.text, subject: email.subject },
        { emailId: email.id, source: 'fixture' }
      );

      leads.push(...parsedLeads);
    } catch (error) {
      console.warn(`Could not load ${filename}:`, error);
    }
  }

  return leads;
}

// Ré-exporter le type Lead pour compatibilité
export type { Lead };
