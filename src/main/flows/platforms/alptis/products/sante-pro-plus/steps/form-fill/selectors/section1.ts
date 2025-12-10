/**
 * Section 1: Mise en place du contrat
 * Identique à Santé Select
 */
export const SECTION_1_SELECTORS = {
  /**
   * Field 1: Remplacement d'un contrat
   * Type: Checkbox
   * Strategy: Use role=checkbox (first on page via .first() in code)
   */
  remplacement_contrat: {
    primary: "role=checkbox",
    fallback: "input[type='checkbox']",
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
