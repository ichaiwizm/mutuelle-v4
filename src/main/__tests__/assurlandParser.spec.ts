import { describe, it, expect } from 'vitest';
import { parseAssurland } from '@/main/leads/parsing/assurland';
import { isLead, detectProvider } from '@/main/leads/detection/detector';
import { parseLead } from '@/main/leads/parsing/parser';
import type { MailMsg } from '@/main/mail/google/client';

// Import Assurland email fixtures
import email003 from './fixtures/emails/email-003.json';
import email004 from './fixtures/emails/email-004.json';

describe('Assurland Detection', () => {
  it('detects email-003 as valid Assurland lead', () => {
    const email = email003 as MailMsg;
    expect(isLead(email)).toBe(true);
  });

  it('detects email-004 as valid Assurland lead', () => {
    const email = email004 as MailMsg;
    expect(isLead(email)).toBe(true);
  });

  it('detects Assurland provider with high confidence (email-003)', () => {
    const email = email003 as MailMsg;
    const result = detectProvider(email);

    expect(result.provider).toBe('Assurland');
    expect(result.confidence).toBe('high');
    expect(result.signals).toContain('assurland_mention');
    expect(result.signals).toContain('assurland_table_structure');
  });

  it('detects Assurland provider with high confidence (email-004)', () => {
    const email = email004 as MailMsg;
    const result = detectProvider(email);

    expect(result.provider).toBe('Assurland');
    expect(result.confidence).toBe('high');
  });
});

describe('parseAssurland - HTML table parsing', () => {
  it('parses email-003 successfully', () => {
    const result = parseAssurland(email003.text);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.errors).toBeUndefined();
  });

  it('extracts contact information from email-003', () => {
    const result = parseAssurland(email003.text);

    expect(result.data?.contact?.civilite).toBe('M');
    expect(result.data?.contact?.nom).toBe('PINELLI');
    expect(result.data?.contact?.prenom).toBe('XAVIER');
    expect(result.data?.contact?.codePostal).toBe('13120');
    expect(result.data?.contact?.ville).toBe('GARDANNE');
    expect(result.data?.contact?.telephone).toBe('0603824772');
    expect(result.data?.contact?.email).toBe('xp17mai@gmail.com');
  });

  it('extracts souscripteur information from email-003', () => {
    const result = parseAssurland(email003.text);

    expect(result.data?.souscripteur?.dateNaissance).toBe('17/05/1971');
    expect(result.data?.souscripteur?.profession).toBe('Profession libérale');
    expect(result.data?.souscripteur?.regimeSocial).toBe('TNS');
    expect(result.data?.souscripteur?.nombreEnfants).toBe(0);
  });

  it('parses email-004 successfully', () => {
    const result = parseAssurland(email004.text);

    expect(result.success).toBe(true);
    expect(result.data?.contact?.nom).toBe('LAURENT');
    expect(result.data?.contact?.prenom).toBe('PIERRE');
    expect(result.data?.contact?.email).toBe('ttnabil@yahoo.fr');
  });
});

describe('parseLead - Assurland integration', () => {
  it('parses Assurland email into Lead format (email-003)', () => {
    const email = email003 as MailMsg;
    const lead = parseLead(
      { text: email.text, subject: email.subject },
      { emailId: email.id, source: 'email' }
    );

    expect(lead).not.toBeNull();
    expect(lead?.id).toBeDefined();
    expect(lead?.subscriber).toBeDefined();
    expect(lead?.subscriber.nom).toBe('PINELLI');
    expect(lead?.subscriber.prenom).toBe('XAVIER');
    expect(lead?.subscriber.email).toBe('xp17mai@gmail.com');
    expect(lead?.project?.emailId).toBe(email.id);
  });

  it('parses Assurland email into Lead format (email-004)', () => {
    const email = email004 as MailMsg;
    const lead = parseLead(
      { text: email.text, subject: email.subject },
      { emailId: email.id, source: 'email' }
    );

    expect(lead).not.toBeNull();
    expect(lead?.subscriber.nom).toBe('LAURENT');
    expect(lead?.subscriber.prenom).toBe('PIERRE');
    expect(lead?.subscriber.telephone).toBe('0662378312');
  });
});

describe('Assurland field normalization', () => {
  it('normalizes MONSIEUR to M', () => {
    const result = parseAssurland(email003.text);
    expect(result.data?.contact?.civilite).toBe('M');
  });

  it('normalizes Travailleurs Non Salariés to TNS', () => {
    const result = parseAssurland(email003.text);
    expect(result.data?.souscripteur?.regimeSocial).toBe('TNS');
  });

  it('cleans email addresses', () => {
    const result = parseAssurland(email003.text);
    expect(result.data?.contact?.email).toBe('xp17mai@gmail.com');
    expect(result.data?.contact?.email).not.toContain('&nbsp;');
  });

  it('handles addresses from v4 field', () => {
    const result = parseAssurland(email003.text);
    expect(result.data?.contact?.adresse).toBe('195 CHEMIN DE BOMPERTUIS');
  });
});

// Sample Assurland text format (tab-separated)
const assurlandTextSample = `Civilite	MONSIEUR
Nom	DUPONT
Prenom	JEAN
v4	10 RUE DE LA PAIX
Code postal	75001
Ville	PARIS
Telephone portable	0612345678
Email	jean.dupont@example.com
Date de naissance	15/03/1980
Age	43 ans
Sexe	Masculin
Profession	Cadre
regime social	Salarié du régime général
Situation familiale	Marié
Nombre d'enfants	2
Date de naissance conjoint	20/06/1982
regime social conjoint	Salarié du régime général
Profession conjoint	Employée
Date de naissance enfants min	01/09/2010
Date de naissance enfants max	15/04/2015
Besoin assurance sante	Changement de situation
Mois d'echeance	Janvier
Assureur actuel	MAAF
Formule choisie	Formule confort
user_id	123456`;

describe('Assurland Text Format Detection', () => {
  it('detects text format as valid lead', () => {
    expect(isLead(assurlandTextSample)).toBe(true);
  });

  it('detects Assurland provider from text format', () => {
    const result = detectProvider(assurlandTextSample);

    expect(result.provider).toBe('Assurland');
    expect(result.signals).toContain('assurland_text_structure');
  });
});

describe('parseAssurland - Text format parsing', () => {
  it('parses text format successfully', () => {
    const result = parseAssurland(assurlandTextSample);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.errors).toBeUndefined();
  });

  it('extracts contact information from text format', () => {
    const result = parseAssurland(assurlandTextSample);

    expect(result.data?.contact?.civilite).toBe('M');
    expect(result.data?.contact?.nom).toBe('DUPONT');
    expect(result.data?.contact?.prenom).toBe('JEAN');
    expect(result.data?.contact?.adresse).toBe('10 RUE DE LA PAIX');
    expect(result.data?.contact?.codePostal).toBe('75001');
    expect(result.data?.contact?.ville).toBe('PARIS');
    expect(result.data?.contact?.telephone).toBe('0612345678');
    expect(result.data?.contact?.email).toBe('jean.dupont@example.com');
  });

  it('extracts souscripteur information from text format', () => {
    const result = parseAssurland(assurlandTextSample);

    expect(result.data?.souscripteur?.dateNaissance).toBe('15/03/1980');
    expect(result.data?.souscripteur?.profession).toBe('Cadre');
    expect(result.data?.souscripteur?.regimeSocial).toBe('Général');
    expect(result.data?.souscripteur?.nombreEnfants).toBe(2);
  });

  it('extracts conjoint information from text format', () => {
    const result = parseAssurland(assurlandTextSample);

    expect(result.data?.conjoint).toBeDefined();
    expect(result.data?.conjoint?.dateNaissance).toBe('20/06/1982');
    expect(result.data?.conjoint?.profession).toBe('Employée');
    expect(result.data?.conjoint?.regimeSocial).toBe('Général');
  });

  it('extracts enfants from min/max dates', () => {
    const result = parseAssurland(assurlandTextSample);

    expect(result.data?.enfants).toHaveLength(2);
    expect(result.data?.enfants?.[0].dateNaissance).toBe('01/09/2010');
    expect(result.data?.enfants?.[1].dateNaissance).toBe('15/04/2015');
  });

  it('skips NON RENSEIGNE values', () => {
    const textWithNonRenseigne = `Civilite	MONSIEUR
Nom	MARTIN
Prenom	PAUL
Telephone portable	0698765432
Email	paul.martin@test.com
Date de naissance	01/01/1990
regime social	Salarié du régime général
Profession	NON RENSEIGNE`;

    const result = parseAssurland(textWithNonRenseigne);

    expect(result.success).toBe(true);
    expect(result.data?.souscripteur?.profession).toBeUndefined();
  });
});

describe('parseAssurland - Format auto-detection', () => {
  it('auto-detects HTML format', () => {
    // email003 is HTML format
    const result = parseAssurland(email003.text);
    expect(result.success).toBe(true);
    expect(result.data?.contact?.nom).toBe('PINELLI');
  });

  it('auto-detects text format', () => {
    const result = parseAssurland(assurlandTextSample);
    expect(result.success).toBe(true);
    expect(result.data?.contact?.nom).toBe('DUPONT');
  });
});
