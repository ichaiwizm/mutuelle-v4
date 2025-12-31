/**
 * Configuration centralisée pour SwissLife One
 * Plateforme: https://www.swisslifeone.fr/
 * Produit: SLSIS (Santé Individuelle et Confort Hospitalisation)
 */

export const SwissLifeOneTimeouts = {
  redirections: 20000,
  dashboardLoad: 30000,
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
