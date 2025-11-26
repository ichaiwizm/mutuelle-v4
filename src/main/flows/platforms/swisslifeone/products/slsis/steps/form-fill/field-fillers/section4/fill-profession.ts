import type { Frame } from '@playwright/test';
import type { FlowLogger } from '../../../../../../../../engine/FlowLogger';
import { SWISSLIFE_STEP1_SELECTORS } from '../../selectors';
import { mapProfessionToFormLabel } from '../../mappers/profession-form-mapper';
import type { AssurePrincipalData } from '../../../../transformers/types';

/**
 * Fill "Profession" field for assure principal (Step 1, Section 4)
 */
export async function fillProfession(
  frame: Frame,
  profession: AssurePrincipalData['profession'],
  logger?: FlowLogger
): Promise<void> {
  const label = mapProfessionToFormLabel(profession);

  logger?.debug('Filling profession', { label, field: '4/5' });

  // Select by label (visible text) instead of by value
  const selectElement = frame.locator(SWISSLIFE_STEP1_SELECTORS.section4.profession_assure_principal.primary).first();
  await selectElement.waitFor({ state: 'visible', timeout: 10000 });
  await selectElement.selectOption({ label });
  await frame.waitForTimeout(2000);

  logger?.debug('Profession selected', { label });
}
