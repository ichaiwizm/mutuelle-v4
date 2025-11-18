/**
 * Error handling helpers for E2E tests
 */
import { expect, type Page, type Locator } from '@playwright/test';

/**
 * Verify that an error message is displayed on the page
 * @param page - Playwright page object
 * @param expectedMessage - Expected error message text (partial match)
 */
export async function verifyErrorMessage(page: Page, expectedMessage: string): Promise<void> {
  const errorLocator = page.locator("[class*='totem-feedback'][class*='danger'], [class*='error']");
  await expect(errorLocator.filter({ hasText: expectedMessage })).toBeVisible({ timeout: 5000 });
  console.log(`✅ [ERROR] Error message found: "${expectedMessage}"`);
}

/**
 * Expect a validation error to be present
 * @param page - Playwright page object
 * @param fieldLabel - Label or identifier of the field with error (optional)
 */
export async function expectValidationError(page: Page, fieldLabel?: string): Promise<void> {
  const errorSelector = "[class*='totem-feedback'][class*='danger']";
  const errorLocator = page.locator(errorSelector);
  const errorCount = await errorLocator.count();

  expect(errorCount).toBeGreaterThan(0);
  console.log(`✅ [ERROR] Found ${errorCount} validation error(s)`);

  if (fieldLabel) {
    const fieldError = page.locator(`label:has-text("${fieldLabel}") ~ ${errorSelector}, label:has-text("${fieldLabel}") + * ${errorSelector}`);
    await expect(fieldError).toBeVisible({ timeout: 2000 });
    console.log(`✅ [ERROR] Validation error found for field: "${fieldLabel}"`);
  }
}

/**
 * Verify that NO error messages are displayed
 * @param page - Playwright page object
 */
export async function verifyNoErrors(page: Page): Promise<void> {
  const errorLocator = page.locator("[class*='totem-feedback'][class*='danger'], [class*='error']");
  const errorCount = await errorLocator.count();
  expect(errorCount).toBe(0);
  console.log('✅ [ERROR] No errors found on page');
}

/**
 * Wait for an error to appear after an action
 * @param page - Playwright page object
 * @param timeout - Timeout in milliseconds (default: 3000)
 */
export async function waitForError(page: Page, timeout: number = 3000): Promise<void> {
  const errorLocator = page.locator("[class*='totem-feedback'][class*='danger']").first();
  await errorLocator.waitFor({ state: 'visible', timeout });
  console.log('✅ [ERROR] Error appeared');
}

/**
 * Get all error messages on the page
 * @param page - Playwright page object
 * @returns Array of error message texts
 */
export async function getAllErrorMessages(page: Page): Promise<string[]> {
  const errorLocator = page.locator("[class*='totem-feedback'][class*='danger'], [class*='error']");
  const errors = await errorLocator.allTextContents();
  console.log(`📋 [ERROR] Found ${errors.length} error(s): ${JSON.stringify(errors)}`);
  return errors;
}
