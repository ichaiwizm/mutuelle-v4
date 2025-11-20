import type { Frame } from '@playwright/test';
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
 */
export async function fillSelectField(
  frame: Frame,
  selector: string,
  value: string,
  options: SelectFillOptions
): Promise<void> {
  const { fieldLabel, fieldNumber, totalFields, skipVerification = false } = options;

  const progressLabel = fieldNumber && totalFields
    ? `[${fieldNumber}/${totalFields}] ${fieldLabel}`
    : fieldLabel;

  console.log(`${progressLabel}: ${value}`);

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

  console.log(`✅ ${fieldLabel} sélectionné avec succès`);
}
