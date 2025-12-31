/**
 * Configuration for Entoria Pack Famille flow
 */

export interface EntoriaFlowConfig {
  platform: 'entoria';
  product: 'pack_famille';
  formUrl: string;
  loginUrl: string;
  timeouts: {
    default: number;
    navigation: number;
    formSubmit: number;
  };
  retries: {
    maxAttempts: number;
    delayMs: number;
    backoffMultiplier: number;
  };
  features: {
    screenshotOnError: boolean;
    debugMode: boolean;
  };
}

export const config: EntoriaFlowConfig = {
  platform: 'entoria',
  product: 'pack_famille',
  formUrl: 'https://espace-partenaire.entoria.fr/devis/pack-famille',
  loginUrl: 'https://espace-partenaire.entoria.fr/login',
  timeouts: {
    default: 30000,
    navigation: 60000,
    formSubmit: 45000,
  },
  retries: {
    maxAttempts: 3,
    delayMs: 1000,
    backoffMultiplier: 2,
  },
  features: {
    screenshotOnError: true,
    debugMode: false,
  },
};
