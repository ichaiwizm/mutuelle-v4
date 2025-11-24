/**
 * Configuration centralisée pour Alptis
 *
 * Ce fichier centralise tous les timeouts, URLs, selectors et credentials
 * pour éviter les magic numbers et strings hardcodés dans le code.
 */

/**
 * Environment types
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * Environment-specific behaviors configuration
 */
export type EnvironmentBehaviors = {
  verbose: boolean;              // Enable detailed logging
  screenshotOnError: boolean;    // Capture screenshots on errors
  screenshotOnSuccess: boolean;  // Capture screenshots on successful completions
};

/**
 * Get current environment from NODE_ENV
 * Defaults to 'development' if not set
 */
export function getEnvironment(): Environment {
  const env = process.env.NODE_ENV as Environment;
  return ['development', 'staging', 'production'].includes(env) ? env : 'development';
}

/**
 * Environment-specific behaviors for each environment
 */
export const AlptisEnvironmentBehaviors: Record<Environment, EnvironmentBehaviors> = {
  development: {
    verbose: true,
    screenshotOnError: true,
    screenshotOnSuccess: true,
  },
  staging: {
    verbose: true,
    screenshotOnError: true,
    screenshotOnSuccess: false,
  },
  production: {
    verbose: false,
    screenshotOnError: false,
    screenshotOnSuccess: false,
  },
};

/**
 * Get environment behaviors for current environment
 */
export function getAlptisEnvironmentBehaviors(env?: Environment): EnvironmentBehaviors {
  const currentEnv = env ?? getEnvironment();
  return AlptisEnvironmentBehaviors[currentEnv];
}

/**
 * Timeouts identifiés dans le code Alptis
 *
 * Basé sur l'analyse de 9 waitForTimeout() et 7 waitFor({ timeout })
 */
export const AlptisTimeouts = {
  // waitForTimeout - Délais fixes
  toggle: 300,              // Après clic sur toggle
  scroll: 500,              // Après scroll vers section
  formFieldsAppear: 500,    // Après activation toggle conjoint/enfants (attente apparition champs)
  accordionAnimation: 500,  // Après ajout enfant (attente animation accordéon)
  dropdownProfession: 500,  // Après fill dropdown catégorie socioprofessionnelle
  dropdownRegime: 700,      // Après fill dropdown régime obligatoire (le plus lent)
  optionClick: 300,         // Après clic option dans dropdown

  // waitFor - Attente éléments
  elementVisible: 5000,     // Attente visibilité élément générique
  buttonEnable: 10000,      // Attente activation bouton "Ajouter enfant"
  buttonDisable: 2000,      // Attente désactivation bouton
} as const;

/**
 * URLs utilisées pour Alptis
 */
export const AlptisUrls = {
  login: 'https://pro.alptis.org/',
  santeSelectForm: 'https://pro.alptis.org/sante-select/informations-projet/',
} as const;

/**
 * Selectors communs réutilisés dans le code Alptis
 */
export const AlptisSelectors = {
  // Input fields
  dateInput: "input[placeholder='Ex : 01/01/2020']",
  regimeDropdown: "input[placeholder='Sélectionner un régime obligatoire']",

  // Components
  toggle: "[class*='totem-toggle__input']",
  dropdownOption: '.totem-select-option__label',

  // Errors
  errorGeneric: '.totem-input__error, .error-message',

  // Buttons
  buttonGaranties: "button:has-text('Garanties')",
  buttonAjouterEnfant: "button:has-text('Ajouter un enfant')",
} as const;

/**
 * Variables d'environnement utilisées pour Alptis
 */
export const AlptisEnvVars = {
  username: 'ALPTIS_TEST_USERNAME',
  password: 'ALPTIS_TEST_PASSWORD',
  debugCookies: 'ALPTIS_DEBUG_COOKIES',
  leadIndex: 'LEAD_INDEX',
} as const;

/**
 * Type pour les credentials Alptis
 */
export type AlptisCredentials = {
  username: string;
  password: string;
};

/**
 * Helper pour récupérer les credentials Alptis depuis l'environnement
 *
 * @throws {Error} Si les credentials ne sont pas définis dans l'environnement
 * @returns Les credentials Alptis
 */
export function getAlptisCredentials(): AlptisCredentials {
  const username = process.env[AlptisEnvVars.username];
  const password = process.env[AlptisEnvVars.password];

  if (!username || !password) {
    throw new Error(
      `Missing Alptis credentials. Please set ${AlptisEnvVars.username} and ${AlptisEnvVars.password} in .env file`
    );
  }

  return { username, password };
}
