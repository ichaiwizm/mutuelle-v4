/**
 * Form selectors for Alptis Santé Select
 * Based on cartography: src/main/flows/cartography/alptis-sante-select-exhaustive-mapping.json
 */

/**
 * Section 1: Mise en place du contrat
 */
export const SECTION_1_SELECTORS = {
  /**
   * Field 1: Remplacement d'un contrat
   * Type: Toggle/Checkbox
   * Stability: UNSTABLE (UUID-based ID)
   * Strategy: Use class selector with position
   */
  remplacement_contrat: {
    primary: "[class*='totem-toggle__input']",
    fallback: "label:has-text('Remplacement d\\'un contrat santé')",
  },

  /**
   * Field 2: Demande de résiliation (CONDITIONAL)
   * Type: Radio
   * Stability: UNSTABLE (UUID in name attribute)
   * Strategy: Use name pattern with value filter
   * Visible only when remplacement_contrat is checked
   */
  demande_resiliation: {
    primary: "input[name*='form-radio']",
    byValue: (value: 'Oui' | 'Non') => `input[name*='form-radio'][value='${value}']`,
    fallback: "label:has-text('Avez-vous déjà fait la demande de résiliation')",
  },

  /**
   * Field 3: Date d'effet
   * Type: Date input
   * Stability: MODERATE (no unique ID, position-based)
   * Strategy: Use placeholder to select all, then .first() in code
   */
  date_effet: {
    primary: "input[placeholder='Ex : 01/01/2020']",
    alternative: "div.dp__main input.totem-input__input",
    byPosition: "input[type='text'][placeholder='Ex : 01/01/2020']:nth-of-type(1)",
  },
} as const;

/**
 * Error message selectors
 */
export const ERROR_SELECTORS = {
  generic: '.totem-input__error, .error-message',
  field: (fieldName: string) => `.totem-input__error:near(#${fieldName})`,
} as const;

/**
 * Button selectors
 */
export const BUTTON_SELECTORS = {
  garanties: "button:has-text('Garanties')",
  ajouterEnfant: "button:has-text('Ajouter un enfant')",
} as const;
