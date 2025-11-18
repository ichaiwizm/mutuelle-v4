/**
 * Section 2: Adhérent(e)
 */
export const SECTION_2_SELECTORS = {
  /**
   * Field 1: Civilité
   * Type: Radio
   * Stability: UNSTABLE (UUID in name attribute)
   * Strategy: Use value selector for monsieur/madame
   * Note: Radio inputs are hidden, styled with custom buttons
   */
  civilite: {
    primary: "input[name*='form-radio']",
    byValue: (value: 'monsieur' | 'madame') => `input[name*='form-radio'][value='${value}']`,
    fallback: "label:has-text('Civilité')",
  },

  /**
   * Field 2: Nom
   * Type: Text
   * Stability: STABLE (consistent ID)
   * Validation: ^[a-zA-ZÀ-ÿ' -]{1,50}$
   */
  nom: {
    primary: '#nom',
  },

  /**
   * Field 3: Prénom
   * Type: Text
   * Stability: STABLE (consistent ID)
   * Validation: ^[a-zA-ZÀ-ÿ' -]+$
   */
  prenom: {
    primary: '#prenom',
  },

  /**
   * Field 4: Date de naissance
   * Type: Date input
   * Stability: WEAK (no unique ID, position-based)
   * Strategy: Use placeholder, then .nth(1) because date_effet is .nth(0)
   * Validation: DD/MM/YYYY, age 18-110
   * IMPORTANT: This is the SECOND date field on the page
   */
  date_naissance: {
    primary: "input[placeholder='Ex : 01/01/2020']",
    note: "Use .nth(1) to get the second date field (first is date_effet)",
  },

  /** Field 5: Catégorie socioprofessionnelle (select, STABLE, use native <select>) */
  categorie_socioprofessionnelle: {
    primary: '#categories-socio-professionnelles-adherent',
  },

  /**
   * Field 6: Cadre d'exercice (CONDITIONAL)
   * Type: Radio
   * Stability: UNSTABLE (UUID in name attribute)
   * Strategy: Use label text matching
   * Visible only for certain professions (AGRICULTEURS, ARTISANS, CHEFS_D_ENTREPRISE, etc.)
   */
  cadre_exercice: {
    primary: "input[name*='form-radio']",
    byValue: (value: 'SALARIE' | 'INDEPENDANT_PRESIDENT_SASU_SAS') => {
      const labelText = value === 'SALARIE' ? 'Salarié' : 'Indépendant Président SASU / SAS';
      return `label:has-text("${labelText}")`;
    },
    fallback: "label:has-text('Cadre d\\'exercice')",
  },

  /** Field 7: Régime obligatoire (select, STABLE, use native <select>) */
  regime_obligatoire: {
    primary: '#regime-obligatoire-adherent',
  },

  /** Field 8: Code postal (text, STABLE, validation ^[0-9]{5}$) */
  code_postal: {
    primary: 'input#codePostal',
  },
} as const;


