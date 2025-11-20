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

  /**
   * Section 5: Données du conjoint
   * Stability: STABLE (uses semantic ID selectors)
   * Note: No departement field for conjoint (only 4 fields vs 5 for assuré principal)
   */
  section5: {
    conjoint_tab: {
      primary: "Conjoint", // Uses getByRole('link', { name: 'Conjoint' })
    },
    date_naissance_conjoint: {
      primary: "#date-naissance-assure-conjoint",
    },
    regime_social_conjoint: {
      primary: "#regime-social-assure-conjoint",
    },
    profession_conjoint: {
      primary: "#profession-assure-conjoint",
    },
    statut_conjoint: {
      primary: "#statut-assure-conjoint",
    },
  },

  /**
   * Section 6: Enfants (Children)
   * Stability: STABLE (uses semantic ID selectors with index pattern)
   * Note: Fields are dynamically created when nombre_enfants > 0
   * Pattern: enfants-{index}-{field} where index is 0-based
   */
  section6: {
    nombre_enfants: {
      primary: "#sante-nombre-enfant-assures",
    },
    // Dynamic selectors (use functions to generate based on child index)
    enfant_date_naissance: (index: number) => `#enfants-${index}-dateNaissance`,
    enfant_ayant_droit: (index: number) => `#enfants-${index}-idAyantDroit`,
  },

  /**
   * Section 7: Gammes et Options (Final section of Step 1)
   * Stability: MODERATE (mix of ID selectors and role-based selectors)
   * Note: reprise_iso_garanties field appears dynamically after gamme selection
   */
  section7: {
    gamme: {
      primary: "#selection-produit-sante",
    },
    date_effet: {
      primary: "#contratSante-dateEffet",
    },
    loi_madelin: {
      byRole: "Loi Madelin", // checkbox, use getByRole('checkbox', { name: 'Loi Madelin' })
    },
    // Radio groups - use nth() to distinguish between multiple radio groups
    reprise_iso_garanties: {
      // nth(2) because there are 2 radio groups before this one (besoins section)
      oui: "oui-reprise", // Will use getByText('oui').nth(2)
      non: "non-reprise", // Will use getByText('non').nth(2)
    },
    resiliation_a_effectuer: {
      primary: "#resiliation-contrat",
      // nth(3) for the 3rd set of oui/non radios
      oui: "oui-resiliation", // Will use getByText('oui').nth(3)
      non: "non-resiliation", // Will use getByText('non').nth(3)
    },
  },
} as const;

export const SWISSLIFE_STEP2_SELECTORS = {
  // Placeholder for future Step 2 selectors
} as const;

export const SWISSLIFE_STEP3_SELECTORS = {
  // Placeholder for future Step 3 selectors
} as const;
