/**
 * Configuration centralisée pour SwissLife One
 * Plateforme: https://www.swisslifeone.fr/
 * Produit: SLSIS (Santé Individuelle et Confort Hospitalisation)
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
export const SwissLifeOneEnvironmentBehaviors: Record<Environment, EnvironmentBehaviors> = {
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
export function getSwissLifeOneEnvironmentBehaviors(env?: Environment): EnvironmentBehaviors {
  const currentEnv = env ?? getEnvironment();
  return SwissLifeOneEnvironmentBehaviors[currentEnv];
}

export const SwissLifeOneTimeouts = {
  redirections: 10000,
  dashboardLoad: 15000,
  navigationIdle: 30000,
  iframeAppear: 60000,
  iframeLoad: 45000,
  iframeReady: 60000,
  elementVisible: 10000,
  afterClick: 2000,
  afterType: 1000,
  retryDelay: 5000,
} as const;

export const SwissLifeOneUrls = {
  login: 'https://www.swisslifeone.fr/',
  adfsBase: 'https://adfs.swisslife.fr/adfs/ls/',
  dashboard: 'https://www.swisslifeone.fr/index-swisslifeOne.html#/accueil',
  slsisForm: 'https://www.swisslifeone.fr/index-swisslifeOne.html#/tarification-et-simulation/slsis',
} as const;

export const SwissLifeOneAuthSelectors = {
  seConnecterButton: 'button, a[href*="login"], a:has-text("Se connecter")',
  usernameField: 'textbox',
  usernameName: 'Identifiant',
  passwordField: 'textbox',
  passwordName: 'Password',
  submitButton: 'button',
  submitText: "Je m'identifie",
} as const;

export const SwissLifeOneSelectors = {
  iframe: 'iframe[name="iFrameTarificateur"]',
  iframeName: 'iFrameTarificateur',
  firstField: 'textbox',
  loader: 'slone-component-loader',
} as const;

export const SwissLifeOneEnvVars = {
  username: 'SWISSLIFEONE_USERNAME',
  password: 'SWISSLIFEONE_PASSWORD',
} as const;

export interface SwissLifeOneCredentials {
  username: string;
  password: string;
}

export function getSwissLifeOneCredentials(): SwissLifeOneCredentials {
  const username = process.env[SwissLifeOneEnvVars.username];
  const password = process.env[SwissLifeOneEnvVars.password];

  if (!username || !password) {
    throw new Error(
      `Missing SwissLife One credentials in environment.\n` +
      `Required: ${SwissLifeOneEnvVars.username} and ${SwissLifeOneEnvVars.password}`
    );
  }

  return { username, password };
}
