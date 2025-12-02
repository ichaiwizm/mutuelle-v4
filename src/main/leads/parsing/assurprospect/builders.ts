import type { ExtractedContact, ExtractedPerson, ExtractedChild, ExtractedBesoin } from '../types';
import { cleanEmail, cleanPhone, parseNumeric } from './utils';

/**
 * Build contact from extracted fields
 */
export function buildContact(fields: Record<string, string>): ExtractedContact {
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

/**
 * Build person (souscripteur or conjoint) from extracted fields
 */
export function buildPerson(fields: Record<string, string>): ExtractedPerson {
  const person: ExtractedPerson = {
    dateNaissance: fields.dateNaissance,
    profession: fields.profession,
    regimeSocial: fields.regimeSocial,
  };

  const nombreEnfants = parseNumeric(fields.nombreEnfants);
  if (nombreEnfants !== undefined) {
    person.nombreEnfants = nombreEnfants;
  }

  return person;
}

/**
 * Build conjoint from extracted fields (with prefixed keys)
 */
export function buildConjoint(fields: Record<string, string>): ExtractedPerson | undefined {
  if (!fields.conjointDateNaissance) {
    return undefined;
  }

  return {
    dateNaissance: fields.conjointDateNaissance,
    profession: fields.conjointProfession,
    regimeSocial: fields.conjointRegimeSocial,
  };
}

/**
 * Build besoin from extracted fields
 */
export function buildBesoin(fields: Record<string, string>): ExtractedBesoin {
  return {
    dateEffet: fields.dateEffet,
    actuellementAssure: fields.actuellementAssure === 'Oui',
    soinsMedicaux: parseNumeric(fields.soinsMedicaux),
    hospitalisation: parseNumeric(fields.hospitalisation),
    optique: parseNumeric(fields.optique),
    dentaire: parseNumeric(fields.dentaire),
  };
}

/**
 * Extract children from text pattern
 */
export function extractChildren(text: string): ExtractedChild[] {
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

/**
 * Extract children from HTML format
 */
export function extractChildrenFromHtml(html: string): ExtractedChild[] {
  const children: ExtractedChild[] = [];
  const pattern = /<strong>Date de naissance du (\d+)(?:er|ème) enfant\s*:<\/strong>&nbsp;(?:<[^>]*>)?(\d{2}\/\d{2}\/\d{4})(?:<\/[^>]*>)?/gi;
  let match;

  while ((match = pattern.exec(html)) !== null) {
    children.push({
      order: parseInt(match[1], 10),
      dateNaissance: match[2],
    });
  }

  return children.sort((a, b) => (a.order || 0) - (b.order || 0));
}
