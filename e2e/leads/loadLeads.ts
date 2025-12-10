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
 * Structure d'un text fixture
 */
type TextFixture = {
  id: string;
  type: 'text';
  text: string;
};

/**
 * Options pour le chargement des fixtures
 */
type LoadOptions = {
  includeEmails?: boolean;
  includeTexts?: boolean;
};

/**
 * Charge tous les leads depuis les fixtures emails en utilisant le parser existant
 * Utilise parseLeads() pour gérer les emails avec plusieurs fiches
 */
export function loadAllLeads(options: LoadOptions = {}): Lead[] {
  const { includeEmails = true, includeTexts = false } = options;
  const leads: Lead[] = [];

  // Charger les fixtures emails
  if (includeEmails) {
    for (let i = 1; i <= 16; i++) {
      const filename = `email-${String(i).padStart(3, '0')}.json`;

      try {
        const email = require(`../../src/main/__tests__/fixtures/emails/${filename}`) as EmailFixture;
        const parsedLeads = parseLeads(
          { text: email.text, subject: email.subject },
          { emailId: email.id, source: 'fixture' }
        );
        leads.push(...parsedLeads);
      } catch (error) {
        console.warn(`Could not load ${filename}:`, error);
      }
    }
  }

  // Charger les fixtures texte
  if (includeTexts) {
    const textFiles = [
      'text-001-basic',
      'text-002-with-signature',
      'text-003-malformed',
      'text-004-incomplete',
    ];

    for (const filename of textFiles) {
      try {
        const fixture = require(`../../src/main/__tests__/fixtures/texts/${filename}.json`) as TextFixture;
        const parsedLeads = parseLeads(fixture.text, { source: 'text-fixture' });
        leads.push(...parsedLeads);
      } catch (error) {
        console.warn(`Could not load ${filename}:`, error);
      }
    }
  }

  return leads;
}

// Ré-exporter le type Lead pour compatibilité
export type { Lead };
