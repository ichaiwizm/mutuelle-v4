import type { Frame } from 'playwright';
import type { FlowLogger } from '../../../../../../../engine/FlowLogger';
import { SwissLifeOneTimeouts } from '../../../../../../../config';
import { fillTextboxField, type TextboxFillOptions } from './TextboxOperations';

const DATEPICKER_SELECTOR = '#ui-datepicker-div';

/**
 * Close the jQuery UI datepicker if it's currently open
 * @param frame - Playwright frame (SwissLife form is in iframe)
 * @param logger - Optional FlowLogger instance
 */
export async function closeDatepicker(
  frame: Frame,
  logger?: FlowLogger
): Promise<void> {
  const datepicker = frame.locator(DATEPICKER_SELECTOR);
  const isVisible = await datepicker.isVisible().catch(() => false);

  if (isVisible) {
    await frame.locator('body').click({ position: { x: 10, y: 10 } });
    await datepicker.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {
      logger?.warn('Datepicker still visible after click');
    });
    await frame.waitForTimeout(SwissLifeOneTimeouts.afterClick);
    logger?.debug('Datepicker closed');
  }
}

/**
 * Fill a date field and close the datepicker that appears
 * @param frame - Playwright frame (SwissLife form is in iframe)
 * @param selector - CSS selector for the date input
 * @param date - Date value in DD/MM/YYYY format
 * @param options - Field metadata for logging
 * @param logger - Optional FlowLogger instance
 */
export async function fillDateField(
  frame: Frame,
  selector: string,
  date: string,
  options: TextboxFillOptions,
  logger?: FlowLogger
): Promise<void> {
  await fillTextboxField(frame, selector, date, options, logger);
  await closeDatepicker(frame, logger);
}
