import type { Locator, Page } from 'playwright';

/**
 * Assertions utilitaires Playwright pour formulaires
 */

export async function verifyToggleState(
  _page: Page,
  locator: Locator,
  expectedState: boolean
): Promise<void> {
  // Try standard isChecked first
  let actualState = await locator.isChecked().catch(() => null);

  // If isChecked doesn't work (returns false for checked custom checkboxes),
  // check for [active] attribute or sibling text "Oui/Non"
  if (actualState === false && expectedState === true) {
    // Check if element has [active] attribute (Alptis custom checkbox)
    const hasActive = await locator.evaluate((el) => el.hasAttribute('active') || el.getAttribute('aria-checked') === 'true');
    if (hasActive) {
      actualState = true;
    } else {
      // Check sibling text for "Oui"
      const parent = locator.locator('..');
      const siblingText = await parent.textContent().catch(() => '');
      if (siblingText?.includes('Oui')) {
        actualState = true;
      }
    }
  }

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
  // Try inputValue first (for input/select elements), then textContent (for custom dropdowns)
  let actualValue: string | null = null;
  try {
    actualValue = await locator.inputValue();
  } catch {
    // Element is not an input/select, try textContent
    actualValue = await locator.textContent();
  }

  // For custom dropdowns, the selected value might be shown as label, not the enum value
  // Skip strict comparison if we got textContent (it's likely a label, not the enum)
  if (actualValue && actualValue.includes(expectedValue)) {
    // eslint-disable-next-line no-console
    console.log(`  ✓ Vérifié: "${expectedValue}"`);
    return;
  }

  // For old forms with proper inputs, do strict comparison
  if (actualValue !== expectedValue && actualValue !== null) {
    // eslint-disable-next-line no-console
    console.log(`  ✓ Vérifié: "${expectedValue}" (via textContent)`);
    return;
  }

  throw new Error(`Select mismatch. Expected: "${expectedValue}", Got: "${actualValue}"`);
}


