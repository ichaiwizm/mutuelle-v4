import { describe, it, expect } from 'vitest';
import { parseLead, parseLeads } from '@/main/leads/parsing/parser';
import { isLead, detectProvider } from '@/main/leads/detection/detector';
import { parseAssurProspect } from '@/main/leads/parsing/assurprospect';
import { readdirSync } from 'fs';
import { join } from 'path';

// Import text fixtures
import text001 from './fixtures/texts/text-001-basic.json';
import text002 from './fixtures/texts/text-002-with-signature.json';
import text003 from './fixtures/texts/text-003-malformed.json';
import text004 from './fixtures/texts/text-004-incomplete.json';

// Import one email for comparison
import email002 from './fixtures/emails/email-002.json';

describe('Text Input Parsing - Basic Functionality', () => {
  it('parses basic plain text (text-001)', () => {
    const lead = parseLead(text001.text);

    expect(lead).not.toBeNull();
    expect(lead?.subscriber.nom).toBe('Dupont');
    expect(lead?.subscriber.prenom).toBe('Jean');
    expect(lead?.subscriber.email).toBe('jean.dupont@example.com');
  });

  it('parses text with signature (text-002)', () => {
    const lead = parseLead(text002.text);

    expect(lead).not.toBeNull();
    expect(lead?.subscriber.nom).toBe('Martin');
    expect(lead?.subscriber.prenom).toBe('Sophie');
    expect(lead?.project?.conjoint).toBeDefined();
    expect(lead?.children).toHaveLength(2);
  });

  it('parses malformed text with whitespace issues (text-003)', () => {
    const lead = parseLead(text003.text);

    expect(lead).not.toBeNull();
    expect(lead?.subscriber.nom).toBe('Doe');
    expect(lead?.subscriber.prenom).toBe('Jane');
    expect(lead?.children).toHaveLength(1);
  });

  it('rejects incomplete text (text-004)', () => {
    const lead = parseLead(text004.text);

    // Should be rejected due to missing "Transmission d'une fiche" marker
    expect(lead).toBeNull();
  });

  it('parses object with text field only', () => {
    const lead = parseLead({ text: text001.text });

    expect(lead).not.toBeNull();
    expect(lead?.subscriber.nom).toBe('Dupont');
  });

  it('parses object with text and subject fields', () => {
    const lead = parseLead({
      text: text002.text,
      subject: 'Test subject'
    });

    expect(lead).not.toBeNull();
    expect(lead?.subscriber.nom).toBe('Martin');
  });
});

describe('Text Input - Metadata Handling', () => {
  it('defaults source to "manual" when not provided', () => {
    const lead = parseLead(text001.text);

    expect(lead?.project?.source).toBe('manual');
    expect(lead?.project?.emailId).toBeUndefined();
  });

  it('allows overriding source metadata', () => {
    const lead = parseLead(text001.text, { source: 'imported' });

    expect(lead?.project?.source).toBe('imported');
  });

  it('allows adding custom emailId for imported text', () => {
    const lead = parseLead(text001.text, {
      emailId: 'custom-id',
      source: 'imported'
    });

    expect(lead?.project?.emailId).toBe('custom-id');
    expect(lead?.project?.source).toBe('imported');
  });

  it('generates unique UUIDs for each lead', async () => {
    const leads = await parseLeads(text002.text);

    expect(leads).toHaveLength(1);
    expect(leads[0].id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });
});

describe('Text Input - Line Ending Normalization', () => {
  it('handles CRLF line endings (Windows)', () => {
    const textWithCRLF = text001.text.replace(/\n/g, '\r\n');
    const lead = parseLead(textWithCRLF);

    expect(lead).not.toBeNull();
    expect(lead?.subscriber.nom).toBe('Dupont');
  });

  it('handles LF line endings (Unix)', () => {
    const textWithLF = text001.text.replace(/\r\n/g, '\n');
    const lead = parseLead(textWithLF);

    expect(lead).not.toBeNull();
    expect(lead?.subscriber.nom).toBe('Dupont');
  });

  it('handles mixed line endings', () => {
    const mixed = text001.text
      .replace(/\n/g, '\n')
      .replace(/\nContact\n/g, '\r\nContact\r\n');
    const lead = parseLead(mixed);

    expect(lead).not.toBeNull();
  });
});

describe('Text Input - Whitespace Handling', () => {
  it('handles extra whitespace around fields', () => {
    const modifiedText = text001.text.replace('Nom : Dupont', 'Nom :    Dupont   ');
    const lead = parseLead(modifiedText);

    expect(lead?.subscriber.nom).toBe('Dupont');
  });

  it('handles trailing whitespace in sections', () => {
    const textWithTrailing = text001.text + '\n\n\n   \n';
    const lead = parseLead(textWithTrailing);

    expect(lead).not.toBeNull();
  });

  it('handles inconsistent spacing (text-003 validation)', () => {
    const lead = parseLead(text003.text);

    // Verify fields are correctly extracted despite spacing issues
    expect(lead?.subscriber.nom).toBe('Doe');
    expect(lead?.subscriber.prenom).toBe('Jane');
    expect(lead?.subscriber.ville).toBe('BORDEAUX');
  });
});

describe('Text Input - Detection Functions', () => {
  it('isLead() works with plain text', () => {
    expect(isLead(text001.text)).toBe(true);
    expect(isLead(text002.text)).toBe(true);
    expect(isLead(text004.text)).toBe(false); // incomplete
  });

  it('detectProvider() works with text containing signature', () => {
    const detection = detectProvider(text002.text);

    // Text-002 has AssurProspect signature
    expect(detection.provider).toBe('AssurProspect');
    expect(['high', 'medium', 'low']).toContain(detection.confidence);
  });

  it('detectProvider() has lower confidence without signature', () => {
    const detection = detectProvider(text001.text);

    // Text-001 has no signature, only structure
    expect(['AssurProspect', 'Unknown']).toContain(detection.provider);
  });
});

describe('Email vs Text Parsing - Compatibility', () => {
  it('Email and text produce identical subscriber data', () => {
    // Parse as email object
    const fromEmail = parseLead(
      { text: email002.text, subject: email002.subject },
      { emailId: email002.id, source: 'email' }
    );

    // Parse as plain text
    const fromText = parseLead(email002.text);

    expect(fromEmail).not.toBeNull();
    expect(fromText).not.toBeNull();

    // Subscriber data must be identical
    expect(fromText?.subscriber.nom).toBe(fromEmail?.subscriber.nom);
    expect(fromText?.subscriber.prenom).toBe(fromEmail?.subscriber.prenom);
    expect(fromText?.subscriber.email).toBe(fromEmail?.subscriber.email);
  });

  it('Metadata differs correctly between email and text', () => {
    const fromEmail = parseLead(
      { text: email002.text, subject: email002.subject },
      { emailId: email002.id, source: 'email' }
    );

    const fromText = parseLead(email002.text);

    // Email has emailId, text doesn't
    expect(fromEmail?.project?.emailId).toBe(email002.id);
    expect(fromEmail?.project?.source).toBe('email');

    expect(fromText?.project?.emailId).toBeUndefined();
    expect(fromText?.project?.source).toBe('manual');
  });

  it('Compatibility across all email fixtures', async () => {
    const FIXTURES_DIR = join(__dirname, 'fixtures/emails');
    const fixtureFiles = readdirSync(FIXTURES_DIR)
      .filter(f => f.endsWith('.json'))
      .sort()
      .slice(0, 5); // Test first 5 for speed

    for (const filename of fixtureFiles) {
      const filepath = join(FIXTURES_DIR, filename);
      const email = require(filepath);

      // Parse both ways
      const fromEmail = await parseLeads(
        { text: email.text, subject: email.subject },
        { emailId: email.id, source: 'email' }
      );

      const fromText = await parseLeads(email.text);

      // Should produce same number of leads
      expect(fromText.length).toBe(fromEmail.length);

      // Each lead's core data should match
      fromText.forEach((textLead, idx) => {
        const emailLead = fromEmail[idx];
        expect(textLead.subscriber).toEqual(emailLead.subscriber);
        expect(textLead.children).toEqual(emailLead.children);
      });
    }
  });
});

describe('Text Input - parseAssurProspect Direct', () => {
  it('works with plain text extracted from text fixture', () => {
    const result = parseAssurProspect(text001.text);

    expect(result.success).toBe(true);
    expect(result.data?.contact?.nom).toBe('Dupont');
    expect(result.data?.contact?.email).toBe('jean.dupont@example.com');
  });

  it('parses incomplete text but may have warnings', () => {
    const result = parseAssurProspect(text004.text);

    // parseAssurProspect doesn't fail on incomplete data, it just extracts what it can
    expect(result.success).toBe(true);
  });
});

describe('Text Input - Multi-Lead Support', () => {
  it('handles single lead in text', async () => {
    const leads = await parseLeads(text001.text);

    expect(leads).toHaveLength(1);
  });

  it('handles multi-lead text if properly formatted', async () => {
    const multiText = text001.text + '\n\n' + text001.text.replace('Dupont', 'Smith');
    const leads = await parseLeads(multiText);

    expect(leads.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Text Input - Error Cases', () => {
  it('returns null for text without Transmission marker', () => {
    const invalidText = 'Contact\nNom : Test\nPrénom : User';
    const lead = parseLead(invalidText);

    expect(lead).toBeNull();
  });

  it('returns null for empty text', () => {
    const lead = parseLead('');

    expect(lead).toBeNull();
  });

  it('returns null for text missing required sections', () => {
    const incompleteText = 'Transmission d\'une fiche\n\nContact\nNom : Test';
    const lead = parseLead(incompleteText);

    expect(lead).toBeNull();
  });

  it('handles text with only whitespace gracefully', () => {
    const lead = parseLead('   \n\n   \t\t   ');

    expect(lead).toBeNull();
  });
});
