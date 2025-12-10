/**
 * Section 3: Conjoint(e)
 * Simplifié pour Santé Pro Plus:
 * - PAS de cadre_exercice (contrairement à Santé Select)
 */
export const SECTION_3_SELECTORS = {
  /**
   * Toggle pour activer/désactiver la section conjoint
   * Type: Toggle/Checkbox
   */
  toggle_conjoint: {
    primary: "[class*='totem-toggle__input']",
    fallback: "label:has-text('Conjoint')",
    note: "Second toggle on the page (after remplacement_contrat)",
  },

  /**
   * Field 1: Date de naissance
   * Type: Date input
   * Contrainte: 18 à 67 ans inclus
   */
  date_naissance: {
    primary: "input[placeholder='Ex : 01/01/2020']",
    note: "Use appropriate .nth() to get the conjoint date field (after adherent)",
  },

  /**
   * Field 2: Catégorie socioprofessionnelle
   * Type: Dropdown (custom Totem select)
   */
  categorie_socioprofessionnelle: {
    primary: '#categories-socio-professionnelles-conjoint',
    fallback: "input[placeholder='Sélectionner une catégorie socioprofessionnelle']",
    dropdownOptions: '.totem-select-option__label',
    note: "Second category dropdown on the page",
  },

  /**
   * Field 3: Régime obligatoire
   * Type: Dropdown (custom Totem select)
   */
  regime_obligatoire: {
    primary: '#regime-obligatoire-conjoint',
    fallback: "input[placeholder='Sélectionner un régime obligatoire']",
    dropdownOptions: '.totem-select-option__label',
    note: "Second regime dropdown on the page",
  },

  // PAS de cadre_exercice pour le conjoint dans Santé Pro Plus
} as const;
