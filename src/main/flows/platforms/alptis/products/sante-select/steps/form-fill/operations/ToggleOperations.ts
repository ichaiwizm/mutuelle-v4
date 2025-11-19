import type { Page } from 'playwright';
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
 */
export async function fillToggleField(
  page: Page,
  shouldCheck: boolean,
  fieldIndex: number,
  fieldLabel: string,
  selector: string = AlptisSelectors.toggle
): Promise<void> {
  console.log(`${fieldLabel}: ${shouldCheck ? 'Oui' : 'Non'}`);

  const toggleLocator = fieldIndex === 0
    ? page.locator(selector).first()
    : page.locator(selector).nth(fieldIndex);

  const isCurrentlyChecked = await toggleLocator.isChecked();

  if (isCurrentlyChecked !== shouldCheck) {
    // Use force: true because the label overlays the input element
    await toggleLocator.click({ force: true });
    console.log(`  ↳ Toggle cliqué (${isCurrentlyChecked ? 'décoché' : 'coché'})`);
    await page.waitForTimeout(AlptisTimeouts.toggle);
  } else {
    console.log(`  ↳ Déjà dans l'état correct`);
  }

  await verifyToggleState(page, toggleLocator, shouldCheck);
}
