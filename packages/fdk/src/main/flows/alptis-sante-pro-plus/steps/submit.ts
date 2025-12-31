/**
 * Submit step for Alptis Sante Pro Plus
 * Handles devis calculation and validation
 */
import type { NavigationStep, ActionDefinition } from '@mutuelle/engine';
import { selectors } from '../selectors';
import { config } from '../config';

const submitActions: ActionDefinition[] = [
  {
    action: 'click',
    selector: selectors.submit.calculerDevis.value,
    waitAfter: 1000,
  },
  {
    action: 'waitFor',
    selector: selectors.navigation.loader.value,
    timeout: 5000,
    state: 'hidden',
  },
  {
    action: 'waitFor',
    selector: selectors.submit.resultPrice.value,
    timeout: config.timeouts.formSubmit,
    state: 'visible',
  },
  {
    action: 'click',
    selector: selectors.submit.validerDevis.value,
    waitAfter: 500,
  },
  {
    action: 'waitForNavigation',
    timeout: config.timeouts.navigation,
  },
];

export const submitStep: NavigationStep = {
  id: 'alptis-submit',
  name: 'Submit Devis',
  description: 'Calculate and validate the devis',
  type: 'navigation',
  timeout: config.timeouts.formSubmit,
  retry: {
    attempts: config.retries.maxAttempts,
    delayMs: config.retries.delayMs,
  },
  actions: submitActions,
};
