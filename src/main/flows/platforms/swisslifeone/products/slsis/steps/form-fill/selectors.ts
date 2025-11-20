/**
 * SwissLife One Form Selectors
 *
 * Selector Stability Annotations:
 * - STABLE: Unlikely to change, uses semantic HTML or ARIA roles
 * - MODERATE: May change with minor UI updates
 * - UNSTABLE: Likely to change, uses generated classes or positions
 */

export const SWISSLIFE_STEP1_SELECTORS = {
  /**
   * Section 1: Nom du projet
   * Position: First field in the form
   * Stability: MODERATE (relies on position)
   */
  section1: {
    nom_projet: {
      primary: "input[type='text']",
      byRole: (nth: number = 0) => `textbox >> nth=${nth}`,
      fallback: "input[name*='projet']",
    },
  },

  /**
   * Section 2: Vos projets (Besoins)
   * Radio groups for coverage needs
   * Stability: UNSTABLE (depends on Angular component structure)
   */
  section2: {
    besoin_couverture_individuelle: {
      primary: "input[type='radio'][name*='couverture']",
      byValue: (value: 'oui' | 'non') => `input[type='radio'][value='${value}']`,
    },
    besoin_indemnites_journalieres: {
      primary: "input[type='radio'][name*='indemnites']",
      byValue: (value: 'oui' | 'non') => `input[type='radio'][value='${value}']`,
    },
  },

  /**
   * Section 3: Couverture santé individuelle
   * Type de simulation selection
   * Stability: MODERATE (uses text-based selection)
   */
  section3: {
    type_simulation: {
      individuel: "Individuel", // Uses getByText with exact: true
      couple: "Pour le couple", // Uses getByText
    },
  },

  /**
   * Section 4: Données de l'assuré principal
   * Stability: STABLE (uses semantic ID selectors)
   */
  section4: {
    date_naissance_assure_principal: {
      primary: "#date-naissance-assure-principal",
    },
    departement_assure_principal: {
      primary: "#departement-assure-principal",
    },
    regime_social_assure_principal: {
      primary: "#regime-social-assure-principal",
    },
    profession_assure_principal: {
      primary: "#profession-assure-principal",
    },
    statut_assure_principal: {
      primary: "#statut-assure-principal",
    },
  },
} as const;

export const SWISSLIFE_STEP2_SELECTORS = {
  // Placeholder for future Step 2 selectors
} as const;

export const SWISSLIFE_STEP3_SELECTORS = {
  // Placeholder for future Step 3 selectors
} as const;
