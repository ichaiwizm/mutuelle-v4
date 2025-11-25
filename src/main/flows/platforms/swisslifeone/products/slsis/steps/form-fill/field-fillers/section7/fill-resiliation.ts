import type { Frame } from '@playwright/test';
import type { FlowLogger } from '../../../../../../../engine/FlowLogger';
import { SwissLifeOneTimeouts } from '../../../../../../../../config';

/**
 * Fill "Resiliation a effectuer" radio group (Step 1, Section 7)
 */
export async function fillResiliationAEffectuer(
  frame: Frame,
  resiliationAEffectuer: boolean,
  logger?: FlowLogger
): Promise<void> {
  const value = resiliationAEffectuer ? 'oui' : 'non';
  logger?.debug('Filling resiliation a effectuer', { value, field: '5/5' });

  logger?.debug('Using getByText approach with nth(3) for fourth oui/non group');

  // Use nth(3) to select the correct radio group (4th set of oui/non radios)
  const radioLabel = frame.getByText(value, { exact: true }).nth(3);
  const count = await frame.getByText(value, { exact: true }).count();
  logger?.debug('Text elements found', { value, count });

  await radioLabel.waitFor({ state: 'visible', timeout: 10000 });
  logger?.debug('Radio label found and visible, clicking...');

  await radioLabel.click();

  await frame.waitForTimeout(SwissLifeOneTimeouts.afterClick);

  logger?.debug('Resiliation a effectuer filled', { value });
}
