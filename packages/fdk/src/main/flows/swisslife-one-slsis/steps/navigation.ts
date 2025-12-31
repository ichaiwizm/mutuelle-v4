/**
 * Navigation step for SwissLife One SLSIS
 * Handles iframe loading with 45s timeout
 */
import type { NavigationStep, ActionDefinition } from '@mutuelle/engine';
import { selectors } from '../selectors';
import { config } from '../config';

const navigationActions: ActionDefinition[] = [
  {
    action: 'goto',
    url: config.formUrl,
    timeout: config.timeouts.navigation,
    waitUntil: 'networkidle',
  },
  {
    action: 'waitFor',
    selector: selectors.navigation.iframe.value,
    timeout: config.timeouts.iframeLoad,
    state: 'attached',
  },
  {
    action: 'switchToIframe',
    selector: selectors.navigation.iframe.value,
    timeout: config.timeouts.iframeLoad,
  },
];

export const navigationStep: NavigationStep = {
  id: 'swisslife-navigation',
  name: 'Navigate to SLSIS Form',
  description: 'Load form page and switch to iframe context',
  type: 'navigation',
  timeout: config.timeouts.navigation,
  retry: {
    attempts: 2,
    delayMs: 2000,
  },
  actions: navigationActions,
};
