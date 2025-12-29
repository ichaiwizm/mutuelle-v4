import type { Frame } from 'playwright';
import type { FlowLogger } from '../../../../../../../../engine/FlowLogger';
import { SWISSLIFE_STEP1_SELECTORS } from '../../selectors';
import { mapProfessionToFormLabel } from '../../mappers/profession-form-mapper';
import type { AssurePrincipalData } from '../../../../transformers/types';

/**
 * Fill "Profession" field for assure principal (Step 1, Section 4)
 * Note: This field is optional and may not exist for certain regime social types
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

  // Check if profession field exists in the DOM (not all regime types have this field)
  const count = await selectElement.count();
  if (count === 0) {
    logger?.debug('Profession field not present in form - skipping (not required for this regime)');
    return;
  }

  // Check if visible (may exist in DOM but be hidden)
  const isVisible = await selectElement.isVisible().catch(() => false);
  if (!isVisible) {
    logger?.debug('Profession dropdown exists but not visible - skipping');
    return;
  }

  await selectElement.selectOption({ label });
  await frame.waitForTimeout(2000);

  logger?.debug('Profession selected', { label });
}
