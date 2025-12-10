/**
 * Section 4: Enfant(s)
 * Identique à Santé Select
 */
export const SECTION_4_SELECTORS = {
  /**
   * Toggle pour activer/désactiver la section enfants
   * Type: Toggle/Checkbox
   */
  toggle_enfants: {
    primary: "[class*='totem-toggle__input']",
    fallback: "label:has-text('Enfant')",
    note: "Third toggle on the page (after conjoint)",
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
   * Contrainte: Jusqu'à 27 ans inclus
   */
  date_naissance: {
    primary: "input[placeholder='Ex : 01/01/2020']",
    note: "Use appropriate .nth() to get each child date field",
  },

  /**
   * Field: Régime obligatoire (pour chaque enfant)
   * Type: Dropdown (custom Totem select)
   * Hérité du souscripteur
   */
  regime_obligatoire: {
    primary: '#regime-obligatoire-enfant',
    fallback: "input[placeholder='Sélectionner un régime obligatoire']",
    dropdownOptions: '.totem-select-option__label',
    note: "May use indexed selectors for multiple children",
  },
} as const;
