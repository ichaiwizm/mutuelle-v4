/**
 * Configuration for Alptis Sante Select flow
 */

export interface AlptisFlowConfig {
  platform: 'alptis';
  product: 'sante_select';
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
  product: 'sante_select',
  formUrl: 'https://pro.alptis.org/sante-select/informations-projet/',
  loginUrl: 'https://pro.alptis.org/login',
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
