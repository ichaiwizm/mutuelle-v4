/**
 * Validateurs d'âge
 */

/**
 * Calcule l'âge exact d'une personne
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  // Ajuster l'âge si l'anniversaire n'est pas encore passé cette année
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
}

/**
 * Valide l'âge d'une personne
 */
export function validateAge(birthDate: Date, minAge: number, maxAge: number): boolean {
  const age = calculateAge(birthDate);
  return age >= minAge && age <= maxAge;
}

/**
 * Valide l'âge du souscripteur (18-110 ans)
 */
export function validateSubscriberAge(birthDate: Date): boolean {
  return validateAge(birthDate, 18, 110);
}

/**
 * Valide l'âge du conjoint (18-110 ans)
 */
export function validateSpouseAge(birthDate: Date): boolean {
  return validateAge(birthDate, 18, 110);
}

/**
 * Valide l'âge d'un enfant (0-27 ans inclus)
 */
export function validateChildAge(birthDate: Date): boolean {
  return validateAge(birthDate, 0, 27);
}
