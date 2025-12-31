/**
 * Navigation step for Alptis Sante Pro Plus
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
    selector: selectors.navigation.newDevisButton.value,
    timeout: config.timeouts.default,
    state: 'visible',
  },
  {
    action: 'click',
    selector: selectors.navigation.newDevisButton.value,
    waitAfter: 500,
  },
  {
    action: 'waitFor',
    selector: selectors.navigation.productSanteProPlus.value,
    timeout: config.timeouts.default,
    state: 'visible',
  },
  {
    action: 'click',
    selector: selectors.navigation.productSanteProPlus.value,
    waitAfter: 1000,
  },
];

export const navigationStep: NavigationStep = {
  id: 'alptis-navigation',
  name: 'Navigate to Sante Pro Plus form',
  description: 'Navigate to the Sante Pro Plus devis form',
  type: 'navigation',
  timeout: config.timeouts.navigation,
  retry: {
    attempts: 2,
    delayMs: 1000,
  },
  actions: navigationActions,
};
