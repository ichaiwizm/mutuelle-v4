/**
 * Validateur de Lead avant transformation pour SwissLifeOne
 */

import type { Lead } from '@/shared/types/lead';
import type { ValidationResult } from '../types';
import {
  validateDateFormat,
  validateCodePostalFormat,
  validateNomFormat,
  validatePrenomFormat,
} from './format-validator';
import { validateSubscriberAge, validateSpouseAge } from './age-validator';

/**
 * Parse une date DD/MM/YYYY en objet Date
 */
function parseDate(dateString: string): Date | null {
  const match = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [_, day, month, year] = match;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

  return isNaN(date.getTime()) ? null : date;
}

/**
 * Valide un lead avant transformation SwissLifeOne
 *
 * Vérifie:
 * - Subscriber: nom, prenom, dateNaissance, codePostal
 * - Conjoint (si présent): dateNaissance
 * - Ages: Principal (18-110), Conjoint (16-99)
 */
export function validateLead(lead: Lead): ValidationResult {
  const errors: string[] = [];

  // Champs critiques du souscripteur
  if (!lead.subscriber.nom) {
    errors.push('Missing subscriber nom (required field)');
  } else if (!validateNomFormat(lead.subscriber.nom as string)) {
    errors.push(
      `Invalid nom format: "${lead.subscriber.nom}". Must contain only letters, accents, hyphens, apostrophes (max 50 chars)`
    );
  }

  if (!lead.subscriber.prenom) {
    errors.push('Missing subscriber prenom (required field)');
  } else if (!validatePrenomFormat(lead.subscriber.prenom as string)) {
    errors.push(
      `Invalid prenom format: "${lead.subscriber.prenom}". Must contain only letters, accents, hyphens, apostrophes`
    );
  }

  if (!lead.subscriber.dateNaissance) {
    errors.push('Missing subscriber birth date (required field)');
  } else {
    if (!validateDateFormat(lead.subscriber.dateNaissance as string)) {
      errors.push(
        `Invalid subscriber birth date format: "${lead.subscriber.dateNaissance}". Expected DD/MM/YYYY`
      );
    } else {
      const birthDate = parseDate(lead.subscriber.dateNaissance as string);
      if (birthDate && !validateSubscriberAge(birthDate)) {
        errors.push('Subscriber age out of range (must be 18-110 years)');
      }
    }
  }

  if (!lead.subscriber.codePostal) {
    errors.push('Missing subscriber code postal (required field)');
  } else if (!validateCodePostalFormat(lead.subscriber.codePostal as string)) {
    errors.push(
      `Invalid code postal format: "${lead.subscriber.codePostal}". Must be exactly 5 digits`
    );
  }

  // Validation du conjoint si présent
  if (lead.project?.conjoint) {
    if (!lead.project.conjoint.dateNaissance) {
      errors.push('Conjoint exists but missing birth date');
    } else {
      if (!validateDateFormat(lead.project.conjoint.dateNaissance as string)) {
        errors.push(
          `Invalid conjoint birth date format: "${lead.project.conjoint.dateNaissance}". Expected DD/MM/YYYY`
        );
      } else {
        const conjointBirthDate = parseDate(lead.project.conjoint.dateNaissance as string);
        if (conjointBirthDate && !validateSpouseAge(conjointBirthDate)) {
          errors.push('Conjoint age out of range (must be 16-99 years for SwissLifeOne)');
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
