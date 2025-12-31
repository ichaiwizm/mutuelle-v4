/**
 * Submit step for Alptis Sante Select
 * Handles: Garanties button, Enregistrer, and Confirm save modal
 */
import type { NavigationStep, ActionDefinition } from '@mutuelle/engine';
import { selectors } from '../selectors';
import { config } from '../config';

const submitActions: ActionDefinition[] = [
  {
    action: 'click',
    selector: selectors.navigation.garantiesButton.value,
    waitBefore: 500,
    timeout: 10000,
  },
  {
    action: 'waitForNavigation',
    waitUntil: 'networkidle',
    timeout: config.timeouts.navigation,
  },
];

const saveActions: ActionDefinition[] = [
  {
    action: 'click',
    selector: selectors.navigation.enregistrerButton.value,
    waitBefore: 1000,
    timeout: 10000,
  },
  {
    action: 'waitFor',
    selector: selectors.navigation.confirmerButton.value,
    state: 'visible',
    timeout: 5000,
  },
];

const confirmActions: ActionDefinition[] = [
  {
    action: 'click',
    selector: selectors.navigation.confirmerButton.value,
    waitBefore: 500,
    timeout: 10000,
  },
  {
    action: 'waitForNavigation',
    waitUntil: 'networkidle',
    timeout: config.timeouts.formSubmit,
  },
];

export const submitStep: NavigationStep = {
  id: 'alptis-submit',
  name: 'Submit Form',
  description: 'Click Garanties button to proceed to step 2',
  type: 'navigation',
  timeout: config.timeouts.formSubmit,
  retry: { attempts: 2, delayMs: 1000 },
  actions: submitActions,
};

export const saveGarantiesStep: NavigationStep = {
  id: 'alptis-save-garanties',
  name: 'Save Garanties',
  description: 'Click Enregistrer on Garanties page',
  type: 'navigation',
  timeout: config.timeouts.default,
  retry: { attempts: 2, delayMs: 1000 },
  actions: saveActions,
};

export const confirmSaveStep: NavigationStep = {
  id: 'alptis-confirm-save',
  name: 'Confirm Save',
  description: 'Click Enregistrer et continuer in confirmation modal',
  type: 'navigation',
  timeout: config.timeouts.formSubmit,
  retry: { attempts: 2, delayMs: 1000 },
  actions: confirmActions,
};
