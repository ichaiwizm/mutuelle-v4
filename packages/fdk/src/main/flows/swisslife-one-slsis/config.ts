/**
 * Configuration for SwissLife One SLSIS flow
 */

export interface SwissLifeFlowConfig {
  platform: 'swisslife';
  product: 'slsis';
  formUrl: string;
  loginUrl: string;
  timeouts: {
    default: number;
    navigation: number;
    iframeLoad: number;
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

export const config: SwissLifeFlowConfig = {
  platform: 'swisslife',
  product: 'slsis',
  formUrl: 'https://swisslife-one.fr/slsis',
  loginUrl: 'https://swisslife-one.fr/login',
  timeouts: {
    default: 30000,
    navigation: 60000,
    iframeLoad: 45000,
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
