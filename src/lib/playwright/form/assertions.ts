import type { Locator, Page } from 'playwright';

/**
 * Assertions utilitaires Playwright pour formulaires
 */

export async function verifyToggleState(
  _page: Page,
  locator: Locator,
  expectedState: boolean
): Promise<void> {
  const actualState = await locator.isChecked();
  if (actualState !== expectedState) {
    throw new Error(`Toggle state mismatch. Expected: ${expectedState}, Got: ${actualState}`);
  }
  // Log volontairement concis pour E2E
  // eslint-disable-next-line no-console
  console.log(`  ✓ Vérifié: toggle ${expectedState ? 'checked' : 'unchecked'}`);
}

export async function verifyRadioSelection(
  _page: Page,
  locator: Locator,
  expectedValue: string
): Promise<void> {
  const isChecked = await locator.isChecked();
  if (!isChecked) {
    throw new Error(`Radio selection failed. Expected "${expectedValue}" to be checked`);
  }
  // eslint-disable-next-line no-console
  console.log(`  ✓ Vérifié: radio "${expectedValue}" sélectionné`);
}

export async function verifyDateValue(
  _page: Page,
  locator: Locator,
  expectedDate: string
): Promise<void> {
  const actualValue = await locator.inputValue();
  if (actualValue !== expectedDate) {
    throw new Error(`Date entry mismatch. Expected: "${expectedDate}", Got: "${actualValue}"`);
  }
  // eslint-disable-next-line no-console
  console.log(`  ✓ Vérifié: date = "${expectedDate}"`);
}

export async function verifyTextValue(
  _page: Page,
  locator: Locator,
  expectedValue: string
): Promise<void> {
  const actualValue = await locator.inputValue();
  if (actualValue !== expectedValue) {
    throw new Error(`Text input mismatch. Expected: "${expectedValue}", Got: "${actualValue}"`);
  }
  // eslint-disable-next-line no-console
  console.log(`  ✓ Vérifié: "${expectedValue}"`);
}

export async function verifySelectValue(
  _page: Page,
  locator: Locator,
  expectedValue: string
): Promise<void> {
  const actualValue = await locator.inputValue();
  if (actualValue !== expectedValue) {
    throw new Error(`Select mismatch. Expected: "${expectedValue}", Got: "${actualValue}"`);
  }
  // eslint-disable-next-line no-console
  console.log(`  ✓ Vérifié: "${expectedValue}"`);
}


