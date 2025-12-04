import type { Frame } from 'playwright';
import type { FlowLogger } from '../../../../../../../../engine/FlowLogger';
import { SwissLifeOneTimeouts } from '../../../../../../../../config';

/**
 * Fill "Reprise de concurrence a iso garanties" radio group (Step 1, Section 7)
 * IMPORTANT: This field appears dynamically after gamme selection
 */
export async function fillRepriseIsoGaranties(
  frame: Frame,
  repriseIsoGaranties: boolean,
  logger?: FlowLogger
): Promise<void> {
  const value = repriseIsoGaranties ? 'oui' : 'non';
  logger?.debug('Filling reprise iso garanties', { value, field: '4/5' });

  // Wait for the radio group to appear (it's conditional on gamme selection)
  logger?.debug('Waiting for reprise iso garanties field to load...');

  // Wait a bit longer for the field to fully load after gamme selection
  await frame.waitForTimeout(3000);

  logger?.debug('Using getByText approach with nth(2) for third oui/non group');

  // Use nth(2) to select the correct radio group (3rd set of oui/non radios on the page)
  // First set: besoin_couverture_individuelle, Second set: besoin_indemnites_journalieres, Third set: reprise_iso_garanties
  const radioLabel = frame.getByText(value, { exact: true }).nth(2);
  const count = await frame.getByText(value, { exact: true }).count();
  logger?.debug('Text elements found', { value, count });

  await radioLabel.waitFor({ state: 'visible', timeout: 10000 });
  logger?.debug('Radio label found and visible, clicking...');

  await radioLabel.click();

  await frame.waitForTimeout(SwissLifeOneTimeouts.afterClick);

  logger?.debug('Reprise iso garanties filled', { value });
}
