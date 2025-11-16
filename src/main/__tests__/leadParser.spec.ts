import { describe, it, expect } from 'vitest';
import { parseLead, parseLeads } from '@/main/leads/parsing/parser';
import { parseAssurProspect } from '@/main/leads/parsing/assurprospect';
import type { MailMsg } from '@/main/mail/google/client';
import { readdirSync } from 'fs';
import { join } from 'path';

// Import specific emails for detailed tests
import email001 from './fixtures/emails/email-001.json'; // Multi-lead (11)
import email002 from './fixtures/emails/email-002.json'; // deleau emilie
import email010 from './fixtures/emails/email-010.json'; // Bazzi Mathieu
import email012 from './fixtures/emails/email-012.json'; // DESCHAMPS BAPTISTE

describe('parseLead - Detailed tests', () => {
  it('parses valid AssurProspect email (email-002)', () => {
    const email = email002 as MailMsg;
    const lead = parseLead({ text: email.text, subject: email.subject }, { emailId: email.id, source: 'email' });

    expect(lead).not.toBeNull();
    expect(lead?.id).toBeDefined();
    expect(lead?.subscriber).toBeDefined();
    expect(lead?.project).toBeDefined();
  });

  it('extracts contact information correctly (email-002)', () => {
    const email = email002 as MailMsg;
    const lead = parseLead({ text: email.text, subject: email.subject }, { emailId: email.id });

    expect(lead?.subscriber.civilite).toBe('Mme');
    expect(lead?.subscriber.nom).toBe('deleau');
    expect(lead?.subscriber.prenom).toBe('emilie');
    expect(lead?.subscriber.telephone).toBe('06.44.37.72.99');
    expect(lead?.subscriber.email).toBe('emilie.deleau15@outlook.fr');
  });

  it('extracts subscriber information correctly (email-002)', () => {
    const email = email002 as MailMsg;
    const lead = parseLead({ text: email.text, subject: email.subject });

    expect(lead?.subscriber.dateNaissance).toBe('15/03/1983');
    expect(lead?.subscriber.profession).toBe('Profession libérale');
    expect(lead?.subscriber.regimeSocial).toBe('TNS : régime des indépendants');
    expect(lead?.subscriber.nombreEnfants).toBe(1);
  });

  it('extracts project/besoin information correctly (email-002)', () => {
    const email = email002 as MailMsg;
    const lead = parseLead({ text: email.text, subject: email.subject });

    expect(lead?.project?.dateEffet).toBe('17/07/2025');
    expect(lead?.project?.actuellementAssure).toBe(true);
    expect(lead?.project?.soinsMedicaux).toBe(4);
    expect(lead?.project?.hospitalisation).toBe(3);
    expect(lead?.project?.optique).toBe(3);
    expect(lead?.project?.dentaire).toBe(3);
  });

  it('extracts children correctly (email-002)', () => {
    const email = email002 as MailMsg;
    const lead = parseLead({ text: email.text, subject: email.subject });

    expect(lead?.children).toBeDefined();
    expect(lead?.children).toHaveLength(1);
    expect(lead?.children?.[0].dateNaissance).toBe('12/03/2010');
  });

  it('handles email without spouse or children (email-010)', () => {
    const email = email010 as MailMsg;
    const lead = parseLead({ text: email.text, subject: email.subject });

    expect(lead).not.toBeNull();
    expect(lead?.subscriber.nom).toBe('Bazzi');
    expect(lead?.subscriber.prenom).toBe('Mathieu');
  });

  it('handles email with uppercase names (email-012)', () => {
    const email = email012 as MailMsg;
    const lead = parseLead({ text: email.text, subject: email.subject });

    expect(lead).not.toBeNull();
    expect(lead?.subscriber.nom).toBe('DESCHAMPS');
    expect(lead?.subscriber.prenom).toBe('BAPTISTE');
  });

  it('returns null for empty body emails', () => {
    const email: MailMsg = {
      id: 'test',
      subject: 'Test',
      from: 'test@example.com',
      date: Date.now(),
      text: '',
    };

    const lead = parseLead({ text: email.text, subject: email.subject });
    expect(lead).toBeNull();
  });

  it('generates unique UUIDs for each lead', () => {
    const email = email002 as MailMsg;
    const lead1 = parseLead({ text: email.text, subject: email.subject });
    const lead2 = parseLead({ text: email.text, subject: email.subject });

    expect(lead1?.id).not.toBe(lead2?.id);
    expect(lead1?.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it('includes email metadata in project', () => {
    const email = email002 as MailMsg;
    const lead = parseLead(
      { text: email.text, subject: email.subject },
      { emailId: email.id, source: 'email' }
    );

    expect(lead?.project?.source).toBe('email');
    expect(lead?.project?.emailId).toBe(email.id);
  });
});

describe('parseLeads - Multi-lead support', () => {
  it('parses multi-lead email correctly (email-001 with 11 leads)', () => {
    const email = email001 as MailMsg;
    const leads = parseLeads(
      { text: email.text, subject: email.subject },
      { emailId: email.id, source: 'email' }
    );

    expect(leads).toHaveLength(11);

    // Verify all have same emailId
    leads.forEach(lead => {
      expect(lead.project?.emailId).toBe(email.id);
    });

    // Verify all have unique UUIDs
    const uuids = leads.map(l => l.id);
    const uniqueUuids = new Set(uuids);
    expect(uniqueUuids.size).toBe(11);

    // Verify first lead
    expect(leads[0].subscriber.nom).toBe('Behloul');
    expect(leads[0].subscriber.prenom).toBe('Nassera');
    expect(leads[0].subscriber.email).toBe('nassera.behloul0727@gmail.com');
  });
});

describe('parseAssurProspect', () => {
  it('returns success for valid email (email-002)', () => {
    const result = parseAssurProspect(email002.text);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.errors).toBeUndefined();
  });

  it('cleans email addresses correctly (email-002)', () => {
    const result = parseAssurProspect(email002.text);

    expect(result.data?.contact?.email).toBe('emilie.deleau15@outlook.fr');
    expect(result.data?.contact?.email).not.toContain('mailto:');
    expect(result.data?.contact?.email).not.toContain('<');
  });

  it('converts actuellement assuré to boolean (email-002)', () => {
    const result = parseAssurProspect(email002.text);
    expect(result.data?.besoin?.actuellementAssure).toBe(true);
  });

  it('parses numeric coverage levels correctly (email-002)', () => {
    const result = parseAssurProspect(email002.text);

    expect(result.data?.besoin?.soinsMedicaux).toBe(4);
    expect(result.data?.besoin?.hospitalisation).toBe(3);
    expect(result.data?.besoin?.optique).toBe(3);
    expect(result.data?.besoin?.dentaire).toBe(3);
  });

  it('handles invalid text gracefully (returns empty sections)', () => {
    const result = parseAssurProspect('invalid text');

    // Parser doesn't throw errors, it just returns empty/undefined sections
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.contact).toBeUndefined();
    expect(result.data?.besoin).toBeUndefined();
  });
});

describe('Field extraction edge cases', () => {
  it('preserves phone format with dots (email-002)', () => {
    const email = email002 as MailMsg;
    const lead = parseLead({ text: email.text, subject: email.subject });

    expect(lead?.subscriber.telephone).toMatch(/^\d{2}\.\d{2}\.\d{2}\.\d{2}\.\d{2}$/);
  });

  it('preserves date format DD/MM/YYYY (email-002)', () => {
    const email = email002 as MailMsg;
    const lead = parseLead({ text: email.text, subject: email.subject });

    expect(lead?.subscriber.dateNaissance).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    expect(lead?.project?.dateEffet).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });
});

describe('TEST EXHAUSTIF: Tous les 16 fixtures', () => {
  const FIXTURES_DIR = join(__dirname, 'fixtures/emails');
  const fixtureFiles = readdirSync(FIXTURES_DIR)
    .filter(f => f.endsWith('.json'))
    .sort();

  for (const filename of fixtureFiles) {
    it(`Parse et vérifie ${filename}`, () => {
      const filepath = join(FIXTURES_DIR, filename);
      const email = require(filepath) as MailMsg;

      // Count expected leads
      const transmissionCount = (email.text.match(/Transmission d['']une fiche/gi) || []).length;

      // Parse
      const leads = parseLeads(
        { text: email.text, subject: email.subject },
        { emailId: email.id, source: 'email' }
      );

      // Verify count
      expect(leads.length).toBe(transmissionCount);

      // Verify each lead has required fields
      leads.forEach((lead, idx) => {
        expect(lead.id, `${filename} lead ${idx + 1}: UUID manquant`).toBeDefined();
        expect(lead.id, `${filename} lead ${idx + 1}: UUID invalide`).toMatch(/^[0-9a-f-]{36}$/);

        expect(lead.subscriber, `${filename} lead ${idx + 1}: subscriber manquant`).toBeDefined();
        expect(lead.subscriber.civilite, `${filename} lead ${idx + 1}: civilité manquante`).toBeDefined();
        expect(lead.subscriber.nom, `${filename} lead ${idx + 1}: nom manquant`).toBeDefined();
        expect(lead.subscriber.prenom, `${filename} lead ${idx + 1}: prénom manquant`).toBeDefined();
        expect(lead.subscriber.email, `${filename} lead ${idx + 1}: email manquant`).toBeDefined();
        expect(lead.subscriber.telephone, `${filename} lead ${idx + 1}: téléphone manquant`).toBeDefined();

        expect(lead.project, `${filename} lead ${idx + 1}: project manquant`).toBeDefined();
        expect(lead.project?.emailId, `${filename} lead ${idx + 1}: emailId manquant`).toBe(email.id);
        expect(lead.project?.source, `${filename} lead ${idx + 1}: source manquante`).toBe('email');
      });
    });
  }

  it('Statistiques finales', () => {
    let totalLeads = 0;
    let totalEmails = 0;
    let emptyEmails = 0;

    for (const filename of fixtureFiles) {
      const filepath = join(FIXTURES_DIR, filename);
      const email = require(filepath) as MailMsg;
      const count = (email.text.match(/Transmission d['']une fiche/gi) || []).length;

      if (count === 0) {
        emptyEmails++;
      } else {
        totalEmails++;
        totalLeads += count;
      }
    }

    console.log(`\n📊 STATISTIQUES FINALES:`);
    console.log(`   Total fixtures: ${fixtureFiles.length}`);
    console.log(`   Emails avec leads: ${totalEmails}`);
    console.log(`   Emails vides: ${emptyEmails}`);
    console.log(`   Total leads parsés: ${totalLeads}\n`);

    expect(totalLeads).toBe(22);
  });
});
