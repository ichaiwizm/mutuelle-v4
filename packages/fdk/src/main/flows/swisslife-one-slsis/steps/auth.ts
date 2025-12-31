/**
 * Authentication step for SwissLife One SLSIS
 * Uses ADFS/SAML authentication
 */
import type { AuthStep } from '@mutuelle/engine';
import { selectors } from '../selectors';
import { config } from '../config';

export const authStep: AuthStep = {
  id: 'swisslife-auth',
  name: 'Authentication SwissLife ADFS/SAML',
  description: 'Login to SwissLife One portal via ADFS/SAML',
  type: 'auth',
  timeout: config.timeouts.navigation,
  retry: {
    attempts: config.retries.maxAttempts,
    delayMs: config.retries.delayMs,
  },
  credentials: {
    username: {
      id: 'username',
      type: 'text',
      selector: selectors.auth.usernameInput,
      source: '{{credentials.username}}',
      label: 'Username',
    },
    password: {
      id: 'password',
      type: 'password',
      selector: selectors.auth.passwordInput,
      source: '{{credentials.password}}',
      label: 'Password',
    },
  },
  submitSelector: selectors.auth.submitButton,
  successIndicator: selectors.auth.dashboardIndicator,
};
