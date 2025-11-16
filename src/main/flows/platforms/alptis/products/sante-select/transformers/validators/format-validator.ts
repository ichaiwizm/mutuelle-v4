/**
 * Validateurs de format
 */

/**
 * Valide le format d'une date DD/MM/YYYY
 */
export function validateDateFormat(dateString: string): boolean {
  const match = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) {
    return false;
  }

  const [_, day, month, year] = match;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

  // Vérifier que la date est valide
  return (
    !isNaN(date.getTime()) &&
    date.getDate() === parseInt(day) &&
    date.getMonth() === parseInt(month) - 1 &&
    date.getFullYear() === parseInt(year)
  );
}

/**
 * Valide le format d'un code postal (5 chiffres)
 */
export function validateCodePostalFormat(codePostal: string): boolean {
  return /^\d{5}$/.test(codePostal);
}

/**
 * Valide le format d'un nom (lettres, accents, hyphens, apostrophes)
 */
export function validateNomFormat(nom: string): boolean {
  return /^[a-zA-ZÀ-ÿ' -]{1,50}$/.test(nom);
}

/**
 * Valide le format d'un prénom (lettres, accents, hyphens, apostrophes)
 */
export function validatePrenomFormat(prenom: string): boolean {
  return /^[a-zA-ZÀ-ÿ' -]+$/.test(prenom);
}
