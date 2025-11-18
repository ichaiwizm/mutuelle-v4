/**
 * Section 3: Conjoint(e)
 */
export const SECTION_3_SELECTORS = {
  /**
   * Toggle pour activer/désactiver la section conjoint
   * Type: Toggle/Checkbox
   * Stability: UNSTABLE (UUID-based ID)
   * Strategy: Use class selector with position or text context
   */
  toggle_conjoint: {
    primary: "[class*='totem-toggle__input']",
    fallback: "label:has-text('Conjoint')",
  },

  /**
   * Field 1: Date de naissance
   * Type: Date input
   * Stability: WEAK (no unique ID, position-based)
   */
  date_naissance: {
    primary: "input[placeholder='Ex : 01/01/2020']",
    note: "Use appropriate .nth() to get the conjoint date field",
  },

  /**
   * Field 2: Catégorie socioprofessionnelle
   * Type: Select
   */
  categorie_socioprofessionnelle: {
    primary: '#categories-socio-professionnelles-conjoint',
  },

  /**
   * Field 3: Cadre d'exercice (conditionnel)
   * Type: Select
   */
  cadre_exercice: {
    primary: '#cadre-exercice-conjoint',
  },

  /**
   * Field 4: Régime obligatoire
   * Type: Select
   */
  regime_obligatoire: {
    primary: '#regime-obligatoire-conjoint',
  },
} as const;
