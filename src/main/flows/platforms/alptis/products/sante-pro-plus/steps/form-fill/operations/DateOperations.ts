import type { Page } from 'playwright';
import type { FlowLogger } from '../../../../../../../engine/FlowLogger';
import { clearAndType, blurField } from '../actions';
import { verifyDateValue } from '../verifiers';
import { AlptisSelectors } from '../../../../../../../config';

/**
 * Generic function to fill date fields (date d'effet, date de naissance, etc.)
 * Uses the common date input selector and handles filling, verification, and blur
 *
 * @param page - Playwright page object
 * @param dateValue - Date string in DD/MM/YYYY format
 * @param fieldIndex - Position of the date field on the page (0 = first, 1 = second, etc.)
 * @param fieldLabel - Label for logging purposes (e.g., "Date d'effet", "Date de naissance")
 * @param logger - Optional FlowLogger instance
 */
export async function fillDateField(
  page: Page,
  dateValue: string,
  fieldIndex: number,
  fieldLabel: string,
  logger?: FlowLogger
): Promise<void> {
  logger?.debug(`Filling ${fieldLabel}`, { fieldLabel, dateValue, fieldIndex });

  const dateSelector = AlptisSelectors.dateInput;
  const locator = page.locator(dateSelector).nth(fieldIndex);

  await clearAndType(locator, dateValue);
  logger?.debug(`Date field filled`, { fieldLabel });

  await verifyDateValue(page, locator, dateValue);
  await blurField(page);
}
