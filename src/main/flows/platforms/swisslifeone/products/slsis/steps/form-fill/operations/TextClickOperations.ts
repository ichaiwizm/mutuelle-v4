import type { Frame } from '@playwright/test';
import { SwissLifeOneTimeouts } from '../../../../../../../config';

export interface TextClickOptions {
  fieldLabel: string;
  fieldNumber?: number;
  totalFields?: number;
  exact?: boolean;
}

/**
 * Click on a text element to select it (e.g., "Individuel" or "Pour le couple")
 * @param frame - Playwright frame (SwissLife form is in iframe)
 * @param text - Text to click on
 * @param options - Field metadata for logging and selection options
 */
export async function clickTextElement(
  frame: Frame,
  text: string,
  options: TextClickOptions
): Promise<void> {
  const { fieldLabel, fieldNumber, totalFields, exact = false } = options;

  const progressLabel = fieldNumber && totalFields
    ? `[${fieldNumber}/${totalFields}] ${fieldLabel}`
    : fieldLabel;

  console.log(`${progressLabel}: ${text}`);

  const element = exact
    ? frame.getByText(text, { exact: true })
    : frame.getByText(text);

  await element.waitFor({ state: 'visible', timeout: SwissLifeOneTimeouts.elementVisible });
  await element.click();
  await frame.waitForTimeout(SwissLifeOneTimeouts.afterClick);

  console.log(`✅ ${fieldLabel} sélectionné: ${text}`);
}
