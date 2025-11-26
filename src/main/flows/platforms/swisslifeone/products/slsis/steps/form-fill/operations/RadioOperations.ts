import type { Frame } from '@playwright/test';
import type { FlowLogger } from '../../../../../../../engine/FlowLogger';
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
 * @param logger - Optional FlowLogger instance
 */
export async function fillRadioField(
  frame: Frame,
  value: boolean,
  options: RadioFillOptions,
  logger?: FlowLogger
): Promise<void> {
  const { fieldLabel, fieldNumber, totalFields, nthIndex = 0 } = options;

  const progressInfo = fieldNumber && totalFields
    ? { field: `${fieldNumber}/${totalFields}` }
    : {};

  const radioValue = value ? 'oui' : 'non';
  logger?.debug(`Filling ${fieldLabel}`, { ...progressInfo, radioValue });

  const radioButton = nthIndex === 0
    ? frame.getByText(radioValue).first()
    : frame.getByText(radioValue).nth(nthIndex);

  await radioButton.waitFor({ state: 'visible', timeout: SwissLifeOneTimeouts.elementVisible });
  await radioButton.click();
  await frame.waitForTimeout(500);

  logger?.debug(`${fieldLabel} selected`, { radioValue });
}
