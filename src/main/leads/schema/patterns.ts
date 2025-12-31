/**
 * Common validation patterns for form fields
 */

export const VALIDATION_PATTERNS = {
  date: "^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/\\d{4}$",
  codePostal: "^\\d{5}$",
  nom: "^[a-zA-ZA-y\\-\\s']+$",
};
