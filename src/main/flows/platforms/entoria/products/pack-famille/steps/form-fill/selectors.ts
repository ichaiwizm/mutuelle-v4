/**
 * Sélecteurs pour le formulaire Entoria TNS Santé
 * Formulaire de tarification en 4 étapes
 */

export const ENTORIA_SELECTORS = {
  // ═══════════════════════════════════════
  // ÉTAPE 1 : PROFIL
  // ═══════════════════════════════════════
  profil: {
    date_naissance: {
      primary: "input[placeholder*='Date de naissance']",
      stability: 'STABLE',
    },
    profession: {
      primary: "input[placeholder*='Profession']",
      note: 'Autocomplete - taper puis sélectionner dans mat-option',
      stability: 'STABLE',
    },
    exerce_en_tant_que: {
      primary: "input[placeholder*='Le client exerce en tant que']",
      note: 'Autocomplete conditionnel - apparaît après sélection profession',
      stability: 'MODERATE',
    },
    departement: {
      primary: "mat-select[aria-label*='Département de résidence']",
      note: 'Mat-select avec recherche',
      stability: 'STABLE',
    },
    prevoyance_entoria: {
      oui: "mat-radio-button:has-text('Oui')",
      non: "mat-radio-button:has-text('Non')",
      stability: 'STABLE',
    },
    continuer: {
      primary: "button:has-text('CONTINUER')",
      stability: 'STABLE',
    },
  },

  // ═══════════════════════════════════════
  // ÉTAPE 2 : BESOIN
  // ═══════════════════════════════════════
  besoin: {
    hospitalisation_oui: {
      primary: "button:has-text('OUI')",
      stability: 'STABLE',
    },
    hospitalisation_non: {
      primary: "button:has-text('NON')",
      stability: 'STABLE',
    },
    suivant: {
      primary: "button:has-text('suivant')",
      stability: 'STABLE',
    },
    retour: {
      primary: "button:has-text('retour')",
      stability: 'STABLE',
    },
  },

  // ═══════════════════════════════════════
  // ÉTAPE 3 : GARANTIES
  // ═══════════════════════════════════════
  garanties: {
    frequence: {
      mensuelle: "mat-radio-button:has-text('Mensuelle')",
      trimestrielle: "mat-radio-button:has-text('Trimestrielle')",
      stability: 'STABLE',
    },
    date_effet: {
      primary: "input[placeholder*='Date d\\'effet']",
      note: 'Peut être pré-rempli',
      stability: 'STABLE',
    },
    ajouter_conjoint: {
      primary: "button:has-text('Son conjoint')",
      stability: 'STABLE',
    },
    ajouter_enfants: {
      primary: "button:has-text('Son/ses enfant(s)')",
      stability: 'STABLE',
    },
    // Formules disponibles (dans le tableau)
    formules: {
      hospi_plus_pro: "cell:has-text('HOSPI+ PRO')",
      eco_pro: "cell:has-text('ECO PRO')",
      essentiel_pro: "cell:has-text('ESSENTIEL PRO')",
      securite_pro: "cell:has-text('SECURITE PRO')",
      confort_pro: "cell:has-text('CONFORT PRO')",
      excellence_pro: "cell:has-text('EXCELLENCE PRO')",
    },
    suivant: {
      primary: "button:has-text('suivant')",
      stability: 'STABLE',
    },
  },

  // ═══════════════════════════════════════
  // COMMUN
  // ═══════════════════════════════════════
  common: {
    mat_option: 'mat-option',
    retour: "button:has-text('retour')",
  },
} as const;
