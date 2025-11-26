import type { Frame } from '@playwright/test';
import type { FlowLogger } from '../../../../../../../../engine/FlowLogger';
import { SWISSLIFE_STEP1_SELECTORS } from '../../selectors';
import { mapRegimeSocialToFormLabel } from '../../mappers/regime-social-form-mapper';
import type { AssurePrincipalData } from '../../../../transformers/types';

/**
 * Fill "Regime social" field for assure principal (Step 1, Section 4)
 */
export async function fillRegimeSocial(
  frame: Frame,
  regimeSocial: AssurePrincipalData['regime_social'],
  logger?: FlowLogger
): Promise<void> {
  const label = mapRegimeSocialToFormLabel(regimeSocial);

  logger?.debug('Filling regime social', { label, field: '3/4' });

  // Select by label (visible text) instead of by value
  const selectElement = frame.locator(SWISSLIFE_STEP1_SELECTORS.section4.regime_social_assure_principal.primary).first();
  await selectElement.waitFor({ state: 'visible', timeout: 10000 });
  await selectElement.selectOption({ label });
  await frame.waitForTimeout(2000);

  logger?.debug('Regime social selected', { label });
}
