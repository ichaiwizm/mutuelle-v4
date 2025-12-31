/**
 * Selectors for Entoria Pack Famille flow
 * Angular Material based form with 4 steps
 */

export const SELECTORS = {
  // Auth selectors
  auth: {
    usernameInput: '#username, input[name="username"]',
    passwordInput: '#password, input[name="password"]',
    submitButton: 'button[type="submit"]',
    dashboardIndicator: '.dashboard-container, [class*="accueil"]',
  },

  // Step 1: Profil
  profil: {
    date_naissance: "input[placeholder*='Date de naissance']",
    profession: "input[placeholder*='Profession']",
    exerce_en_tant_que: "input[placeholder*='Le client exerce en tant que']",
    departement: "mat-select[aria-label*='Département de résidence']",
    prevoyance: {
      oui: "mat-radio-button:has-text('Oui')",
      non: "mat-radio-button:has-text('Non')",
    },
    continuer: "button:has-text('CONTINUER')",
  },

  // Step 2: Besoin
  besoin: {
    hospitalisation_oui: "button:has-text('OUI')",
    hospitalisation_non: "button:has-text('NON')",
    suivant: "button:has-text('suivant')",
    retour: "button:has-text('retour')",
  },

  // Step 3: Garanties
  garanties: {
    frequence: {
      mensuelle: "mat-radio-button:has-text('Mensuelle')",
      trimestrielle: "mat-radio-button:has-text('Trimestrielle')",
    },
    date_effet: "input[placeholder*=\"Date d'effet\"]",
    ajouter_conjoint: "button:has-text('Son conjoint')",
    ajouter_enfants: "button:has-text('Son/ses enfant(s)')",
    formules: {
      hospi_plus_pro: "cell:has-text('HOSPI+ PRO')",
      eco_pro: "cell:has-text('ECO PRO')",
      essentiel_pro: "cell:has-text('ESSENTIEL PRO')",
      securite_pro: "cell:has-text('SECURITE PRO')",
      confort_pro: "cell:has-text('CONFORT PRO')",
      excellence_pro: "cell:has-text('EXCELLENCE PRO')",
    },
    suivant: "button:has-text('suivant')",
  },

  // Common selectors
  common: {
    mat_option: 'mat-option',
    loader: '.loading-spinner, .mat-progress-spinner',
    retour: "button:has-text('retour')",
    modal_ok: "button:has-text('OK')",
  },

  // Navigation
  navigation: {
    dashboard: 'text=Assurances de personnes individuelles',
    santeTNS: 'text=Santé TNS',
    nextStep: "button:has-text('suivant'), button:has-text('CONTINUER')",
    prevStep: "button:has-text('retour')",
  },
} as const;

export type Selectors = typeof SELECTORS;
