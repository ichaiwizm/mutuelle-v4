/**
 * AssurProspect-specific parser
 */

import { splitIntoSections, extractFields } from './extractors';
import type { ParseResult, ExtractedContact, ExtractedPerson, ExtractedChild, ExtractedBesoin } from './types';

export function parseAssurProspect(text: string): ParseResult {
  try {
    const sections = splitIntoSections(text);
    const warnings: string[] = [];

    // Extract Contact
    const contact = sections.contact ? parseContact(extractFields(sections.contact)) : undefined;
    if (!contact?.email) warnings.push('Missing contact email');

    // Extract Souscripteur
    const souscripteur = sections.souscripteur
      ? parsePerson(extractFields(sections.souscripteur))
      : undefined;
    if (!souscripteur?.dateNaissance) warnings.push('Missing birth date');

    // Extract Conjoint (optional)
    const conjoint = sections.conjoint ? parsePerson(extractFields(sections.conjoint)) : undefined;

    // Extract Enfants (optional)
    const enfants = sections.enfants ? extractChildren(sections.enfants) : undefined;

    // Extract Besoin
    const besoin = sections.besoin ? parseBesoin(extractFields(sections.besoin)) : undefined;

    return {
      success: true,
      data: { contact, souscripteur, conjoint, enfants, besoin },
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown parsing error'],
    };
  }
}

function parseContact(fields: Record<string, string>): ExtractedContact {
  return {
    civilite: fields.civilite,
    nom: fields.nom,
    prenom: fields.prenom,
    adresse: fields.adresse,
    codePostal: fields.codePostal,
    ville: fields.ville,
    telephone: cleanPhone(fields.telephone),
    email: cleanEmail(fields.email),
  };
}

function parsePerson(fields: Record<string, string>): ExtractedPerson {
  return {
    dateNaissance: fields.dateNaissance,
    profession: fields.profession,
    regimeSocial: fields.regimeSocial,
    nombreEnfants: parseNumeric(fields.nombreEnfants),
  };
}

function parseBesoin(fields: Record<string, string>): ExtractedBesoin {
  return {
    dateEffet: fields.dateEffet,
    actuellementAssure: fields.actuellementAssure === 'Oui',
    soinsMedicaux: parseNumeric(fields.soinsMedicaux),
    hospitalisation: parseNumeric(fields.hospitalisation),
    optique: parseNumeric(fields.optique),
    dentaire: parseNumeric(fields.dentaire),
  };
}

function extractChildren(text: string): ExtractedChild[] {
  const children: ExtractedChild[] = [];
  const pattern = /Date de naissance du (\d+)(?:er|ème) enfant\s*:\s*(\d{2}\/\d{2}\/\d{4})/gi;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    children.push({
      order: parseInt(match[1], 10),
      dateNaissance: match[2],
    });
  }

  return children.sort((a, b) => (a.order || 0) - (b.order || 0));
}

function cleanEmail(value?: string): string | undefined {
  if (!value) return undefined;
  const match = value.match(/([^\s<]+@[^\s>]+)/);
  return match ? match[1] : value;
}

function cleanPhone(value?: string): string | undefined {
  return value?.trim();
}

function parseNumeric(value?: string): number | undefined {
  if (!value) return undefined;
  const num = parseInt(value, 10);
  return isNaN(num) ? undefined : num;
}
