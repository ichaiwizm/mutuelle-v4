import type { Frame } from '@playwright/test';
import type { FlowLogger } from '../../../../../../engine/FlowLogger';
import { SwissLifeOneTimeouts } from '../../../../../../../config';

export interface TextboxFillOptions {
  fieldLabel: string;
  fieldNumber?: number;
  totalFields?: number;
  skipVerification?: boolean;
}

/**
 * Fill a textbox field with the provided value
 * @param frame - Playwright frame (SwissLife form is in iframe)
 * @param selector - CSS selector or Playwright locator method
 * @param value - Value to fill
 * @param options - Field metadata for logging
 * @param logger - Optional FlowLogger instance
 */
export async function fillTextboxField(
  frame: Frame,
  selector: string,
  value: string,
  options: TextboxFillOptions,
  logger?: FlowLogger
): Promise<void> {
  const { fieldLabel, fieldNumber, totalFields, skipVerification = false } = options;

  const progressInfo = fieldNumber && totalFields
    ? { field: `${fieldNumber}/${totalFields}` }
    : {};

  logger?.debug(`Filling ${fieldLabel}`, { ...progressInfo, value });

  const textbox = frame.locator(selector).first();

  await textbox.waitFor({ state: 'visible', timeout: SwissLifeOneTimeouts.elementVisible });
  await textbox.clear();
  await textbox.fill(value);
  await textbox.blur();
  await frame.waitForTimeout(SwissLifeOneTimeouts.afterType);

  if (!skipVerification) {
    const filledValue = await textbox.inputValue();
    if (filledValue !== value) {
      throw new Error(`Verification failed for ${fieldLabel}. Expected: "${value}", Got: "${filledValue}"`);
    }
  }

  logger?.debug(`${fieldLabel} filled successfully`, { value });
}
