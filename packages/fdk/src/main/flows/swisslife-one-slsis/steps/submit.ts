/**
 * Submit step for SwissLife One SLSIS
 * Clicks the Suivant button to submit the form
 */
import type { NavigationStep, ActionDefinition } from '@mutuelle/engine';
import { selectors } from '../selectors';
import { config } from '../config';

const submitActions: ActionDefinition[] = [
  {
    action: 'waitFor',
    selector: selectors.navigation.nextButton.value,
    timeout: 10000,
    state: 'visible',
  },
  {
    action: 'click',
    selector: selectors.navigation.nextButton.value,
    waitBefore: 500,
  },
  {
    action: 'waitForNavigation',
    timeout: config.timeouts.formSubmit,
    waitUntil: 'networkidle',
  },
];

export const submitStep: NavigationStep = {
  id: 'swisslife-submit',
  name: 'Submit Form',
  description: 'Click Suivant button to submit SLSIS form',
  type: 'navigation',
  timeout: config.timeouts.formSubmit,
  retry: {
    attempts: 2,
    delayMs: 1000,
  },
  actions: submitActions,
};
