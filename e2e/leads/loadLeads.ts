import { parseLead } from '@/main/leads/parsing/parser';
import { splitEmailIntoLeadBlocks } from '@/main/leads/parsing/extractors';
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
 * Charge tous les leads depuis les fixtures emails en utilisant le parser synchrone
 * Utilise parseLead() (synchrone) au lieu de parseLeads() (async)
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
        const metadata = { emailId: email.id, source: 'fixture' };

        // Essayer de splitter en blocs multiples (AssurProspect)
        const blocks = splitEmailIntoLeadBlocks(email.text);
        if (blocks.length > 0) {
          for (const block of blocks) {
            const lead = parseLead(block, metadata);
            if (lead) {
              leads.push(lead);
            }
          }
        } else {
          // Sinon essayer comme lead unique
          const lead = parseLead({ text: email.text, subject: email.subject }, metadata);
          if (lead) {
            leads.push(lead);
          }
        }
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
        const lead = parseLead(fixture.text, { source: 'text-fixture' });
        if (lead) {
          leads.push(lead);
        }
      } catch (error) {
        console.warn(`Could not load ${filename}:`, error);
      }
    }
  }

  return leads;
}

// Ré-exporter le type Lead pour compatibilité
export type { Lead };
