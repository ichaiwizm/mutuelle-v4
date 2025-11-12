import { describe, it, expect } from 'vitest';
import { parseLead } from '@/main/leads/parsing/parser';
import { parseAssurProspect } from '@/main/leads/parsing/assurprospect';
import type { MailMsg } from '@/main/mail/google/client';

// Import email fixtures
import email001 from './fixtures/emails/email-001.json';
import email005 from './fixtures/emails/email-005.json';
import email009 from './fixtures/emails/email-009.json';
import email010 from './fixtures/emails/email-010.json';
import email014 from './fixtures/emails/email-014.json';

describe('parseLead', () => {
  it('parses valid AssurProspect email (email-001)', () => {
    const email = email001 as MailMsg;
    const lead = parseLead({ text: email.text, subject: email.subject }, { emailId: email.id, source: 'email' });

    expect(lead).not.toBeNull();
    expect(lead?.id).toBeDefined();
    expect(lead?.subscriber).toBeDefined();
    expect(lead?.project).toBeDefined();
  });

  it('extracts contact information correctly (email-001)', () => {
    const email = email001 as MailMsg;
    const lead = parseLead({ text: email.text, subject: email.subject }, { emailId: email.id });

    expect(lead?.subscriber.civilite).toBe('Mme');
    expect(lead?.subscriber.nom).toBe('deleau');
    expect(lead?.subscriber.prenom).toBe('emilie');
    expect(lead?.subscriber.telephone).toBe('06.44.37.72.99');
    expect(lead?.subscriber.email).toBe('emilie.deleau15@outlook.fr');
  });

  it('extracts subscriber information correctly (email-001)', () => {
    const email = email001 as MailMsg;
    const lead = parseLead({ text: email.text, subject: email.subject });

    expect(lead?.subscriber.dateNaissance).toBe('15/03/1983');
    expect(lead?.subscriber.profession).toBe('Profession libérale');
    expect(lead?.subscriber.regimeSocial).toBe('TNS : régime des indépendants');
    expect(lead?.subscriber.nombreEnfants).toBe(1);
  });

  it('extracts project/besoin information correctly (email-001)', () => {
    const email = email001 as MailMsg;
    const lead = parseLead({ text: email.text, subject: email.subject });

    expect(lead?.project?.dateEffet).toBe('17/07/2025');
    expect(lead?.project?.actuellementAssure).toBe(true);
    expect(lead?.project?.soinsMedicaux).toBe(4);
    expect(lead?.project?.hospitalisation).toBe(3);
    expect(lead?.project?.optique).toBe(3);
    expect(lead?.project?.dentaire).toBe(3);
  });

  it('extracts children correctly (email-001)', () => {
    const email = email001 as MailMsg;
    const lead = parseLead({ text: email.text, subject: email.subject });

    expect(lead?.children).toBeDefined();
    expect(lead?.children).toHaveLength(1);
    expect(lead?.children?.[0].dateNaissance).toBe('12/03/2010');
  });

  it('extracts spouse (conjoint) information when present (email-005)', () => {
    const email = email005 as MailMsg;
    const lead = parseLead({ text: email.text, subject: email.subject });

    expect(lead?.project?.conjoint).toBeDefined();
    expect(lead?.project?.conjoint?.dateNaissance).toBe('26/04/1983');
    expect(lead?.project?.conjoint?.profession).toBe('En recherche d\'emploi');
  });

  it('handles multiple children correctly (email-009)', () => {
    const email = email009 as MailMsg;
    const lead = parseLead({ text: email.text, subject: email.subject });

    expect(lead?.children).toBeDefined();
    expect(lead?.children).toHaveLength(3);
    expect(lead?.children?.[0].dateNaissance).toBe('07/09/2016');
    expect(lead?.children?.[1].dateNaissance).toBe('09/07/2019');
    expect(lead?.children?.[2].dateNaissance).toBe('10/05/2021');
  });

  it('handles email without spouse or children (email-010)', () => {
    const email = email010 as MailMsg;
    const lead = parseLead({ text: email.text, subject: email.subject });

    expect(lead).not.toBeNull();
    expect(lead?.project?.conjoint).toBeUndefined();
    expect(lead?.children).toBeUndefined();
  });

  it('handles email with generic subject (email-014)', () => {
    const email = email014 as MailMsg;
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
    const email = email001 as MailMsg;
    const lead1 = parseLead({ text: email.text, subject: email.subject });
    const lead2 = parseLead({ text: email.text, subject: email.subject });

    expect(lead1?.id).not.toBe(lead2?.id);
    expect(lead1?.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it('includes email metadata in project', () => {
    const email = email001 as MailMsg;
    const lead = parseLead(
      { text: email.text, subject: email.subject },
      { emailId: email.id, source: 'email' }
    );

    expect(lead?.project?.source).toBe('email');
    expect(lead?.project?.emailId).toBe(email.id);
  });
});

describe('parseAssurProspect', () => {
  it('returns success for valid email', () => {
    const result = parseAssurProspect(email001.text);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.errors).toBeUndefined();
  });

  it('extracts all sections correctly', () => {
    const result = parseAssurProspect(email005.text);

    expect(result.success).toBe(true);
    expect(result.data?.contact).toBeDefined();
    expect(result.data?.souscripteur).toBeDefined();
    expect(result.data?.conjoint).toBeDefined();
    expect(result.data?.enfants).toBeDefined();
    expect(result.data?.besoin).toBeDefined();
  });

  it('handles missing optional sections', () => {
    const result = parseAssurProspect(email010.text);

    expect(result.success).toBe(true);
    expect(result.data?.contact).toBeDefined();
    expect(result.data?.souscripteur).toBeDefined();
    expect(result.data?.conjoint).toBeUndefined();
    expect(result.data?.enfants).toBeUndefined();
    expect(result.data?.besoin).toBeDefined();
  });

  it('cleans email addresses correctly', () => {
    const result = parseAssurProspect(email001.text);

    expect(result.data?.contact?.email).toBe('emilie.deleau15@outlook.fr');
    expect(result.data?.contact?.email).not.toContain('mailto:');
    expect(result.data?.contact?.email).not.toContain('<');
  });

  it('converts actuellement assuré to boolean', () => {
    const result = parseAssurProspect(email001.text);
    expect(result.data?.besoin?.actuellementAssure).toBe(true);

    const result2 = parseAssurProspect(email005.text);
    expect(result2.data?.besoin?.actuellementAssure).toBe(false);
  });

  it('parses numeric coverage levels correctly', () => {
    const result = parseAssurProspect(email001.text);

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
    expect(result.data?.souscripteur).toBeUndefined();
  });
});

describe('Field extraction edge cases', () => {
  it('handles case variations in names', () => {
    const email1 = email001 as MailMsg;
    const email2 = email014 as MailMsg;
    const lead1 = parseLead({ text: email1.text, subject: email1.subject }); // lowercase
    const lead2 = parseLead({ text: email2.text, subject: email2.subject }); // UPPERCASE

    expect(lead1?.subscriber.nom).toBe('deleau');
    expect(lead2?.subscriber.nom).toBe('DESCHAMPS');
  });

  it('preserves phone format with dots', () => {
    const email = email001 as MailMsg;
    const lead = parseLead({ text: email.text, subject: email.subject });

    expect(lead?.subscriber.telephone).toMatch(/^\d{2}\.\d{2}\.\d{2}\.\d{2}\.\d{2}$/);
  });

  it('preserves date format DD/MM/YYYY', () => {
    const email = email001 as MailMsg;
    const lead = parseLead({ text: email.text, subject: email.subject });

    expect(lead?.subscriber.dateNaissance).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    expect(lead?.project?.dateEffet).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });
});
