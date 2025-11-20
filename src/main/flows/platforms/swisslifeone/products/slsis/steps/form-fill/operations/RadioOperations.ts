import type { Frame } from '@playwright/test';
import { SwissLifeOneTimeouts } from '../../../../../../../config';

export interface RadioFillOptions {
  fieldLabel: string;
  fieldNumber?: number;
  totalFields?: number;
  nthIndex?: number;
}

/**
 * Fill a radio button field with the provided value
 * Uses text-based selection with nth index for multiple radio groups
 * @param frame - Playwright frame (SwissLife form is in iframe)
 * @param value - Value to select (true for 'oui', false for 'non')
 * @param options - Field metadata for logging and selection
 */
export async function fillRadioField(
  frame: Frame,
  value: boolean,
  options: RadioFillOptions
): Promise<void> {
  const { fieldLabel, fieldNumber, totalFields, nthIndex = 0 } = options;

  const progressLabel = fieldNumber && totalFields
    ? `[${fieldNumber}/${totalFields}] ${fieldLabel}`
    : fieldLabel;

  const radioValue = value ? 'oui' : 'non';
  console.log(`${progressLabel}: ${radioValue}`);

  const radioButton = nthIndex === 0
    ? frame.getByText(radioValue).first()
    : frame.getByText(radioValue).nth(nthIndex);

  await radioButton.waitFor({ state: 'visible', timeout: SwissLifeOneTimeouts.elementVisible });
  await radioButton.click();
  await frame.waitForTimeout(500);

  console.log(`✅ ${fieldLabel} sélectionné: ${radioValue}`);
}
