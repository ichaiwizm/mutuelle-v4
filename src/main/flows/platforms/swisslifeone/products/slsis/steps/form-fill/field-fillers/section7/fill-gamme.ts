import type { Frame } from '@playwright/test';
import type { FlowLogger } from '../../../../../../../../engine/FlowLogger';
import { SWISSLIFE_STEP1_SELECTORS } from '../../selectors';
import { mapGammeToFormLabel } from '../../mappers/gamme-form-mapper';
import type { GammesOptionsData } from '../../../../transformers/types';

/**
 * Fill "Gamme/Produit Sante" field (Step 1, Section 7)
 */
export async function fillGamme(
  frame: Frame,
  gamme: GammesOptionsData['gamme'],
  logger?: FlowLogger
): Promise<void> {
  const label = mapGammeToFormLabel(gamme);

  logger?.debug('Filling gamme', { label, field: '1/5', selector: SWISSLIFE_STEP1_SELECTORS.section7.gamme.primary });

  const selectElement = frame.locator(SWISSLIFE_STEP1_SELECTORS.section7.gamme.primary).first();
  await selectElement.waitFor({ state: 'visible', timeout: 10000 });

  logger?.debug('Element visible, selecting option', { label });
  await selectElement.selectOption({ label });

  // Verify selection
  const selectedValue = await selectElement.inputValue();
  logger?.debug('Option selected', { label, selectedValue });

  await frame.waitForTimeout(2000); // Wait for conditional fields to appear

  logger?.debug('Gamme selected successfully', { label });
}
