/**
 * Transformateur de dates pour SwissLifeOne
 * Gestion des dates d'effet et dates de naissance
 */

import { validateDateFormat } from '../validators/format-validator';

/**
 * Parse une date DD/MM/YYYY en objet Date
 */
export function parseDate(dateString: string): Date | null {
  const match = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [_, day, month, year] = match;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

  return isNaN(date.getTime()) ? null : date;
}

/**
 * Formate une date en DD/MM/YYYY
 */
export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Calcule la prochaine date d'effet valide (1er du mois prochain)
 */
export function getNextValidDateEffet(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Stratégie: 1er du mois prochain
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  // S'assurer qu'elle est au moins 5 jours dans le futur
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + 5);

  if (nextMonth < minDate) {
    // Aller au 1er du mois d'après
    return new Date(today.getFullYear(), today.getMonth() + 2, 1);
  }

  return nextMonth;
}

/**
 * Vérifie si une date d'effet est valide (minimum 5 jours dans le futur)
 */
export function isValidDateEffet(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + 5);

  return date >= minDate;
}

/**
 * Transforme la date d'effet du lead
 * Fallback: 1er du mois prochain si invalide ou trop proche
 */
export function transformDateEffet(leadDateEffet: string | undefined): string {
  if (!leadDateEffet || !validateDateFormat(leadDateEffet)) {
    console.warn(`[DATE_EFFET] ⚠️  Invalid or missing date (${leadDateEffet}), using next valid date`);
    const nextValid = getNextValidDateEffet();
    return formatDate(nextValid);
  }

  const parsedDate = parseDate(leadDateEffet);
  if (!parsedDate) {
    console.warn(`[DATE_EFFET] ⚠️  Failed to parse date (${leadDateEffet}), using next valid date`);
    const nextValid = getNextValidDateEffet();
    return formatDate(nextValid);
  }

  if (isValidDateEffet(parsedDate)) {
    return formatDate(parsedDate);
  }

  console.warn(`[DATE_EFFET] ⚠️  Date in past or too soon (${leadDateEffet}), using next valid date`);
  const nextValid = getNextValidDateEffet();
  return formatDate(nextValid);
}

/**
 * Transforme une date de naissance (valide le format uniquement)
 * Throw une erreur si le format est invalide
 */
export function transformBirthDate(birthDate: string): string {
  if (!validateDateFormat(birthDate)) {
    throw new Error(`Invalid birth date format: ${birthDate}. Expected DD/MM/YYYY`);
  }

  const parsed = parseDate(birthDate);
  if (!parsed) {
    throw new Error(`Invalid birth date: ${birthDate}`);
  }

  return formatDate(parsed);
}
