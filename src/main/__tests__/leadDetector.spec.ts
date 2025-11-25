import { describe, it, expect } from 'vitest';
import { isLead, detectProvider } from '@/main/leads/detection/detector';
import type { MailMsg } from '@/main/mail/google/client';

// Import email fixtures
import email001 from './fixtures/emails/email-001.json';
import email002 from './fixtures/emails/email-002.json';
import email005 from './fixtures/emails/email-005.json';
import email014 from './fixtures/emails/email-014.json';
import email015 from './fixtures/emails/email-015.json';

describe('isLead', () => {
  it('identifies valid AssurProspect lead (email-001)', () => {
    const email = email001 as MailMsg;
    expect(isLead(email)).toBe(true);
  });

  it('identifies valid AssurProspect lead with different subject (email-014)', () => {
    const email = email014 as MailMsg;
    expect(isLead(email)).toBe(true);
  });

  it('identifies valid AssurProspect lead with spouse and multiple children (email-015)', () => {
    const email = email015 as MailMsg;
    expect(isLead(email)).toBe(true);
  });

  it('identifies valid AssurProspect lead (email-002)', () => {
    const email = email002 as MailMsg;
    expect(isLead(email)).toBe(true);
  });

  it('rejects empty forward (email-005)', () => {
    const email = email005 as MailMsg;
    expect(isLead(email)).toBe(false);
  });

  it('rejects email with missing required sections', () => {
    const email: MailMsg = {
      id: 'test',
      subject: 'Test',
      from: 'test@example.com',
      date: Date.now(),
      text: 'Transmission d\'une fiche\n\nContact\nCivilité : M.\nNom : Test',
    };
    expect(isLead(email)).toBe(false);
  });

  it('rejects email with missing required fields', () => {
    const email: MailMsg = {
      id: 'test',
      subject: 'Test',
      from: 'test@example.com',
      date: Date.now(),
      text: 'Transmission d\'une fiche\n\nContact\n\nSouscripteur\n\nBesoin\n\n',
    };
    expect(isLead(email)).toBe(false);
  });
});

describe('detectProvider', () => {
  it('detects AssurProspect with high confidence (email-001)', () => {
    const email = email001 as MailMsg;
    const result = detectProvider(email);

    expect(result.provider).toBe('AssurProspect');
    expect(result.confidence).toBe('high');
    expect(result.signals).toContain('assurprospect_domain');
    expect(result.signals).toContain('assurprospect_signature');
    expect(result.signals.length).toBeGreaterThanOrEqual(3);
  });

  it('detects AssurProspect with high confidence despite generic subject (email-014)', () => {
    const email = email014 as MailMsg;
    const result = detectProvider(email);

    expect(result.provider).toBe('AssurProspect');
    expect(result.confidence).toBe('high');
    expect(result.signals).toContain('assurprospect_domain');
  });

  it('detects AssurProspect for all valid emails', () => {
    const validEmails = [email001, email002, email014, email015];

    validEmails.forEach((email) => {
      const result = detectProvider(email as MailMsg);
      expect(result.provider).toBe('AssurProspect');
      expect(result.confidence).not.toBe('low');
    });
  });

  it('returns Unknown for empty emails', () => {
    const email = email005 as MailMsg;
    const result = detectProvider(email);

    expect(result.provider).toBe('Unknown');
    expect(result.confidence).toBe('low');
    expect(result.signals.length).toBe(0);
  });

  it('detects provider from body even with generic subject', () => {
    const email: MailMsg = {
      id: 'test',
      subject: 'LEAD',
      from: 'test@example.com',
      date: Date.now(),
      text: `Transmission d'une fiche

Pour contacter AssurProspect.fr
L'équipe AssurProspect
contact@assurprospect.fr`,
    };

    const result = detectProvider(email);
    expect(result.provider).toBe('AssurProspect');
    expect(result.confidence).toBe('high');
  });
});

describe('Provider detection signals', () => {
  it('identifies all AssurProspect signals correctly', () => {
    const email = email002 as MailMsg; // email-002 has "AssurProspect.fr" in subject
    const result = detectProvider(email);

    // Should have multiple strong signals
    expect(result.signals).toContain('assurprospect_domain');
    expect(result.signals).toContain('assurprospect_signature');
    expect(result.signals).toContain('assurprospect_email');
    expect(result.signals).toContain('assurprospect_subject');
    expect(result.signals).toContain('assurprospect_structure');
  });

  it('works without subject signal', () => {
    const email: MailMsg = {
      id: 'test',
      subject: 'Random Subject',
      from: 'test@example.com',
      date: Date.now(),
      text: email001.text,
    };

    const result = detectProvider(email);
    expect(result.provider).toBe('AssurProspect');
    expect(result.confidence).toBe('high');
    expect(result.signals).not.toContain('assurprospect_subject');
  });
});

describe('Edge cases', () => {
  it('handles very short text', () => {
    const email: MailMsg = {
      id: 'test',
      subject: 'Test',
      from: 'test@example.com',
      date: Date.now(),
      text: 'Short text',
    };

    expect(isLead(email)).toBe(false);
  });

  it('handles null/undefined text gracefully', () => {
    const email: MailMsg = {
      id: 'test',
      subject: 'Test',
      from: 'test@example.com',
      date: Date.now(),
      text: '',
    };

    expect(isLead(email)).toBe(false);
    const result = detectProvider(email);
    expect(result.provider).toBe('Unknown');
  });

  it('handles forwarded emails correctly', () => {
    const email: MailMsg = {
      id: 'test',
      subject: 'Fwd: Some Lead',
      from: 'test@example.com',
      date: Date.now(),
      text: '',
    };

    expect(isLead(email)).toBe(false);
  });
});
