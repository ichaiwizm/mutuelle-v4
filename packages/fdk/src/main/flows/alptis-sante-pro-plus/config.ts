/**
 * Configuration for Alptis Sante Pro Plus flow
 */

export interface AlptisFlowConfig {
  platform: 'alptis';
  product: 'sante_pro_plus';
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

export const config: AlptisFlowConfig = {
  platform: 'alptis',
  product: 'sante_pro_plus',
  formUrl: 'https://extranet.alptis.fr/devis/sante-pro-plus',
  loginUrl: 'https://extranet.alptis.fr/login',
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
