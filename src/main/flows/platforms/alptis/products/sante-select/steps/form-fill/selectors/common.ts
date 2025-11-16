/**
 * Selectors communs (erreurs, boutons)
 */
export const ERROR_SELECTORS = {
  generic: '.totem-input__error, .error-message',
  field: (fieldName: string) => `.totem-input__error:near(#${fieldName})`,
} as const;

export const BUTTON_SELECTORS = {
  garanties: "button:has-text('Garanties')",
  ajouterEnfant: "button:has-text('Ajouter un enfant')",
} as const;


