/**
 * Validateurs de format partagés
 */

/**
 * Valide le format d'une date DD/MM/YYYY
 * Vérifie que la date existe réellement (pas de 31/02/2024 par exemple)
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
 * Valide le format d'un code postal français (5 chiffres)
 */
export function validateCodePostalFormat(codePostal: string): boolean {
  return /^\d{5}$/.test(codePostal);
}

/**
 * Valide le format d'un nom (lettres, accents, hyphens, apostrophes)
 * Max 50 caractères
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

/**
 * Valide le format d'un email
 */
export function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
