/**
 * Verification functions for form fields
 * Extracted from FormFillStep to keep files under 140 lines
 */
import type { Page } from 'playwright';

/**
 * Verify toggle state
 */
export async function verifyToggleState(page: Page, locator: any, expectedState: boolean): Promise<void> {
  const actualState = await locator.isChecked();

  if (actualState !== expectedState) {
    throw new Error(
      `Toggle state mismatch. Expected: ${expectedState}, Got: ${actualState}`
    );
  }

  console.log(`  ✓ Vérifié: toggle ${expectedState ? 'checked' : 'unchecked'}`);
}

/**
 * Verify radio selection
 */
export async function verifyRadioSelection(page: Page, locator: any, expectedValue: string): Promise<void> {
  const isChecked = await locator.isChecked();

  if (!isChecked) {
    throw new Error(
      `Radio selection failed. Expected "${expectedValue}" to be checked`
    );
  }

  console.log(`  ✓ Vérifié: radio "${expectedValue}" sélectionné`);
}

/**
 * Verify date input value
 */
export async function verifyDateValue(page: Page, locator: any, expectedDate: string): Promise<void> {
  const actualValue = await locator.inputValue();

  if (actualValue !== expectedDate) {
    throw new Error(
      `Date entry mismatch. Expected: "${expectedDate}", Got: "${actualValue}"`
    );
  }

  console.log(`  ✓ Vérifié: date = "${expectedDate}"`);
}

/**
 * Verify text input value
 */
export async function verifyTextValue(page: Page, locator: any, expectedValue: string): Promise<void> {
  const actualValue = await locator.inputValue();

  if (actualValue !== expectedValue) {
    throw new Error(
      `Text input mismatch. Expected: "${expectedValue}", Got: "${actualValue}"`
    );
  }

  console.log(`  ✓ Vérifié: "${expectedValue}"`);
}
