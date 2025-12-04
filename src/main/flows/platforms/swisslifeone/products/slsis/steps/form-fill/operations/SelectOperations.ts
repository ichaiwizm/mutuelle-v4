import type { Frame } from 'playwright';
import type { FlowLogger } from '../../../../../../../engine/FlowLogger';
import { SwissLifeOneTimeouts } from '../../../../../../../config';

export interface SelectFillOptions {
  fieldLabel: string;
  fieldNumber?: number;
  totalFields?: number;
  skipVerification?: boolean;
}

/**
 * Fill a select/combobox field with the provided value
 * @param frame - Playwright frame (SwissLife form is in iframe)
 * @param selector - CSS selector for the select element
 * @param value - Value to select (option value attribute)
 * @param options - Field metadata for logging
 * @param logger - Optional FlowLogger instance
 */
export async function fillSelectField(
  frame: Frame,
  selector: string,
  value: string,
  options: SelectFillOptions,
  logger?: FlowLogger
): Promise<void> {
  const { fieldLabel, fieldNumber, totalFields, skipVerification = false } = options;

  const progressInfo = fieldNumber && totalFields
    ? { field: `${fieldNumber}/${totalFields}` }
    : {};

  logger?.debug(`Filling ${fieldLabel}`, { ...progressInfo, value });

  const selectElement = frame.locator(selector).first();

  await selectElement.waitFor({ state: 'visible', timeout: SwissLifeOneTimeouts.elementVisible });
  await selectElement.selectOption(value);
  await frame.waitForTimeout(SwissLifeOneTimeouts.afterClick);

  if (!skipVerification) {
    const selectedValue = await selectElement.inputValue();
    if (selectedValue !== value) {
      throw new Error(`Verification failed for ${fieldLabel}. Expected: "${value}", Got: "${selectedValue}"`);
    }
  }

  logger?.debug(`${fieldLabel} selected successfully`, { value });
}
