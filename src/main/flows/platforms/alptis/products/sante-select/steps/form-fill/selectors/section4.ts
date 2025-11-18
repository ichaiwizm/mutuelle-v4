/**
 * Section 4: Enfant(s)
 */
export const SECTION_4_SELECTORS = {
  /**
   * Toggle pour activer/désactiver la section enfants
   * Type: Toggle/Checkbox
   * Stability: UNSTABLE (UUID-based ID)
   * Strategy: Use class selector with position (nth(2) - third toggle)
   */
  toggle_enfants: {
    primary: "[class*='totem-toggle__input']",
    fallback: "label:has-text('Enfant')",
  },

  /**
   * Bouton pour ajouter un enfant supplémentaire
   * Type: Button
   */
  bouton_ajouter_enfant: {
    primary: "button:has-text('Ajouter un enfant')",
  },

  /**
   * Field: Date de naissance (pour chaque enfant)
   * Type: Date input
   * Stability: WEAK (no unique ID, position-based)
   * Note: Use appropriate .nth() to get each child's date field
   * - nth(3) = 1er enfant
   * - nth(4) = 2ème enfant
   * - etc.
   */
  date_naissance: {
    primary: "input[placeholder='Ex : 01/01/2020']",
    note: "Use appropriate .nth() to get each child date field (starts at nth(3))",
  },

  /**
   * Field: Régime obligatoire (pour chaque enfant)
   * Type: Select
   * Note: Hérité du souscripteur, mais peut-être affiché en lecture seule ou non rempli
   */
  regime_obligatoire: {
    primary: '#regime-obligatoire-enfant',
    note: "May use indexed IDs like #regime-obligatoire-enfant-1, #regime-obligatoire-enfant-2, etc.",
  },
} as const;
