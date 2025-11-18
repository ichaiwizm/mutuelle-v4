import type { Page } from 'playwright';
import { clearAndType, blurField } from '../actions';
import { verifyDateValue } from '../verifiers';

/**
 * Generic function to fill date fields (date d'effet, date de naissance, etc.)
 * Uses the common date input selector and handles filling, verification, and blur
 *
 * @param page - Playwright page object
 * @param dateValue - Date string in DD/MM/YYYY format
 * @param fieldIndex - Position of the date field on the page (0 = first, 1 = second, etc.)
 * @param fieldLabel - Label for logging purposes (e.g., "Date d'effet", "Date de naissance")
 */
export async function fillDateField(
  page: Page,
  dateValue: string,
  fieldIndex: number,
  fieldLabel: string
): Promise<void> {
  console.log(`${fieldLabel}: ${dateValue}`);

  const dateSelector = "input[placeholder='Ex : 01/01/2020']";
  const locator = page.locator(dateSelector).nth(fieldIndex);

  await clearAndType(locator, dateValue);
  console.log(`  ↳ Date saisie`);

  await verifyDateValue(page, locator, dateValue);
  await blurField(page);
}
