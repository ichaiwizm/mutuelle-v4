/**
 * Validateurs de format - Identique à Santé Select
 */

/**
 * Valide le format d'une date (DD/MM/YYYY)
 */
export function validateDateFormat(date: string): boolean {
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  return regex.test(date);
}

/**
 * Valide le format d'un code postal (5 chiffres)
 */
export function validateCodePostalFormat(codePostal: string): boolean {
  const regex = /^\d{5}$/;
  return regex.test(codePostal);
}

/**
 * Valide le format d'un nom (lettres, accents, tirets, apostrophes)
 */
export function validateNomFormat(nom: string): boolean {
  const regex = /^[a-zA-ZÀ-ÿ\-']{1,50}$/;
  return regex.test(nom);
}

/**
 * Valide le format d'un prénom (lettres, accents, tirets, apostrophes)
 */
export function validatePrenomFormat(prenom: string): boolean {
  const regex = /^[a-zA-ZÀ-ÿ\-']{1,50}$/;
  return regex.test(prenom);
}
