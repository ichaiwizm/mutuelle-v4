/**
 * Section 6: Enfants step for SwissLife One SLSIS
 * Conditional step with dynamic child handling
 */
import type { NavigationStep, ActionDefinition } from '@mutuelle/engine';
import { selectors } from '../selectors';
import { config } from '../config';

/**
 * Creates dynamic actions for each child
 * This step uses NavigationStep since it needs dynamic action generation
 */
function createEnfantActions(childIndex: number): ActionDefinition[] {
  return [
    {
      action: 'click',
      selector: selectors.enfants.addButton.value,
      waitAfter: 500,
    },
    {
      action: 'waitFor',
      selector: selectors.enfants.dateNaissance(childIndex),
      timeout: 5000,
    },
    {
      action: 'fill',
      selector: selectors.enfants.dateNaissance(childIndex),
      value: `{{formData.enfants[${childIndex}].dateNaissance}}`,
    },
    {
      action: 'selectOption',
      selector: selectors.enfants.regime(childIndex),
      value: `{{formData.enfants[${childIndex}].regime}}`,
    },
  ];
}

// Base step for first child (index 0)
const baseEnfantActions: ActionDefinition[] = [
  {
    action: 'waitFor',
    selector: selectors.enfants.container.value,
    timeout: 10000,
  },
  ...createEnfantActions(0),
];

export const enfantsStep: NavigationStep = {
  id: 'swisslife-enfants',
  name: 'Section 6: Enfants',
  description: 'Fill children details (conditional, dynamic)',
  type: 'navigation',
  timeout: config.timeouts.default,
  condition: {
    expression: '{{formData.enfants.length > 0}}',
    type: 'if',
  },
  optional: true,
  retry: { attempts: 2, delayMs: 500 },
  actions: baseEnfantActions,
};

// Export helper for runtime dynamic child creation
export { createEnfantActions };
