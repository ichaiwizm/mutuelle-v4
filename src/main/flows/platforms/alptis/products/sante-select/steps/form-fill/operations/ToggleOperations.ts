import type { Page } from 'playwright';
import type { FlowLogger } from '../../../../../../engine/FlowLogger';
import { verifyToggleState } from '../verifiers';
import { AlptisTimeouts, AlptisSelectors } from '../../../../../../../config';

/**
 * Generic function to fill toggle fields
 * Used for: remplacement_contrat, conjoint, enfants toggles
 *
 * @param page - Playwright page object
 * @param shouldCheck - Whether the toggle should be checked
 * @param fieldIndex - Position of the toggle on the page (0 = first, 1 = second, etc.)
 * @param fieldLabel - Label for logging purposes
 * @param selector - CSS selector for the toggle
 * @param logger - Optional FlowLogger instance
 */
export async function fillToggleField(
  page: Page,
  shouldCheck: boolean,
  fieldIndex: number,
  fieldLabel: string,
  selector: string = AlptisSelectors.toggle,
  logger?: FlowLogger
): Promise<void> {
  logger?.debug(`Filling ${fieldLabel}`, { fieldLabel, shouldCheck, fieldIndex });

  const toggleLocator = fieldIndex === 0
    ? page.locator(selector).first()
    : page.locator(selector).nth(fieldIndex);

  const isCurrentlyChecked = await toggleLocator.isChecked();

  if (isCurrentlyChecked !== shouldCheck) {
    // Use force: true because the label overlays the input element
    await toggleLocator.click({ force: true });
    logger?.debug(`Toggle clicked`, { fieldLabel, wasChecked: isCurrentlyChecked, nowChecked: shouldCheck });
    await page.waitForTimeout(AlptisTimeouts.toggle);
  } else {
    logger?.debug(`Toggle already in correct state`, { fieldLabel, shouldCheck });
  }

  await verifyToggleState(page, toggleLocator, shouldCheck);
}
