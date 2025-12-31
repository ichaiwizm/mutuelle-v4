/**
 * Navigation step for Alptis Sante Select
 */
import type { NavigationStep, ActionDefinition } from '@mutuelle/engine';
import { config } from '../config';

const navigationActions: ActionDefinition[] = [
  {
    action: 'goto',
    url: config.formUrl,
    waitUntil: 'networkidle',
    timeout: config.timeouts.navigation,
  },
  {
    action: 'waitFor',
    selector: "input[placeholder='Ex : 01/01/2020']",
    state: 'visible',
    timeout: 10000,
  },
];

export const navigationStep: NavigationStep = {
  id: 'alptis-navigation',
  name: 'Navigation to Form',
  description: 'Navigate to Alptis Sante Select form page',
  type: 'navigation',
  timeout: config.timeouts.navigation,
  retry: {
    attempts: 2,
    delayMs: 1000,
  },
  actions: navigationActions,
};
