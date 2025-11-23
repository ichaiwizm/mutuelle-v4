/**
 * Error handling helpers for SwissLife One E2E tests
 * Frame-aware versions of error detection utilities
 */
import { expect, type Frame, type Locator } from '@playwright/test';

/**
 * Verify that an error message is displayed in the frame
 * @param frame - Playwright frame object (SwissLife One uses iframe)
 * @param expectedMessage - Expected error message text (partial match)
 */
export async function verifyErrorMessage(frame: Frame, expectedMessage: string): Promise<void> {
  const errorLocator = frame.locator("[class*='totem-feedback'][class*='danger'], [class*='error']");
  await expect(errorLocator.filter({ hasText: expectedMessage })).toBeVisible({ timeout: 5000 });
  console.log(`✅ [ERROR] Error message found: "${expectedMessage}"`);
}

/**
 * Expect a validation error to be present
 * @param frame - Playwright frame object
 * @param fieldLabel - Label or identifier of the field with error (optional)
 */
export async function expectValidationError(frame: Frame, fieldLabel?: string): Promise<void> {
  const errorSelector = "[class*='totem-feedback'][class*='danger']";
  const errorLocator = frame.locator(errorSelector);
  const errorCount = await errorLocator.count();

  expect(errorCount).toBeGreaterThan(0);
  console.log(`✅ [ERROR] Found ${errorCount} validation error(s)`);

  if (fieldLabel) {
    const fieldError = frame.locator(`label:has-text("${fieldLabel}") ~ ${errorSelector}, label:has-text("${fieldLabel}") + * ${errorSelector}`);
    await expect(fieldError).toBeVisible({ timeout: 2000 });
    console.log(`✅ [ERROR] Validation error found for field: "${fieldLabel}"`);
  }
}

/**
 * Verify that NO error messages are displayed
 * @param frame - Playwright frame object
 */
export async function verifyNoErrors(frame: Frame): Promise<void> {
  const errorLocator = frame.locator("[class*='totem-feedback'][class*='danger'], [class*='error']");
  const errorCount = await errorLocator.count();
  expect(errorCount).toBe(0);
  console.log('✅ [ERROR] No errors found in frame');
}

/**
 * Wait for an error to appear after an action
 * @param frame - Playwright frame object
 * @param timeout - Timeout in milliseconds (default: 3000)
 */
export async function waitForError(frame: Frame, timeout: number = 3000): Promise<void> {
  const errorLocator = frame.locator("[class*='totem-feedback'][class*='danger']").first();
  await errorLocator.waitFor({ state: 'visible', timeout });
  console.log('✅ [ERROR] Error appeared');
}

/**
 * Get all error messages in the frame
 * @param frame - Playwright frame object
 * @returns Array of error message texts
 */
export async function getAllErrorMessages(frame: Frame): Promise<string[]> {
  const errorLocator = frame.locator("[class*='totem-feedback'][class*='danger'], [class*='error']");
  const errors = await errorLocator.allTextContents();
  console.log(`📋 [ERROR] Found ${errors.length} error(s): ${JSON.stringify(errors)}`);
  return errors;
}
