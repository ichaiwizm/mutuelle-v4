import type { ExtractedContact, ExtractedPerson, ExtractedChild, ExtractedBesoin } from '../types';
import {
  normalizeCivilite,
  normalizeRegimeSocial,
  cleanEmail,
  cleanPhone,
  parseNumeric,
  isValidDate,
} from './utils';

/**
 * Build contact object from extracted fields
 */
export function buildContact(fields: Record<string, string>): ExtractedContact {
  return {
    civilite: normalizeCivilite(fields.civilite),
    nom: fields.nom,
    prenom: fields.prenom,
    adresse: fields.adresse,
    codePostal: fields.codePostal,
    ville: fields.ville,
    telephone: cleanPhone(fields.telephone || fields.telephoneDomicile),
    email: cleanEmail(fields.email),
  };
}

/**
 * Build souscripteur object from extracted fields
 */
export function buildSouscripteur(fields: Record<string, string>): ExtractedPerson {
  const person: ExtractedPerson = {
    dateNaissance: fields.dateNaissance,
    profession: fields.profession,
    regimeSocial: normalizeRegimeSocial(fields.regimeSocial),
  };

  const nombreEnfants = parseNumeric(fields.nombreEnfants);
  if (nombreEnfants !== undefined) {
    person.nombreEnfants = nombreEnfants;
  }

  return person;
}

/**
 * Build conjoint object from extracted fields
 */
export function buildConjoint(fields: Record<string, string>): ExtractedPerson {
  return {
    dateNaissance: fields.conjointDateNaissance,
    profession: fields.conjointProfession,
    regimeSocial: normalizeRegimeSocial(fields.conjointRegimeSocial),
  };
}

/**
 * Build enfants array from min/max date fields
 * Assurland provides min and max birth dates for children
 */
export function buildEnfants(fields: Record<string, string>): ExtractedChild[] {
  const enfants: ExtractedChild[] = [];

  // If we have min date, add as first child
  if (fields.enfantsDateMin && isValidDate(fields.enfantsDateMin)) {
    enfants.push({ dateNaissance: fields.enfantsDateMin, order: 1 });
  }

  // If we have max date and it's different from min, add as second child
  if (fields.enfantsDateMax && isValidDate(fields.enfantsDateMax)) {
    if (fields.enfantsDateMax !== fields.enfantsDateMin) {
      enfants.push({ dateNaissance: fields.enfantsDateMax, order: 2 });
    }
  }

  return enfants;
}

/**
 * Build besoin object from extracted fields
 */
export function buildBesoin(fields: Record<string, string>): ExtractedBesoin {
  // Assurland doesn't have the same besoin structure as AssurProspect
  // We map what we can
  return {
    // Note: Assurland doesn't provide dateEffet in the same way
    actuellementAssure: fields.assureurActuel ? true : undefined,
  };
}
