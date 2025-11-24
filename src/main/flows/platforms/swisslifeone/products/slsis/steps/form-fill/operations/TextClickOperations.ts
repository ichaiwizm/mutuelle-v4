import type { Frame } from '@playwright/test';
import type { FlowLogger } from '../../../../../../engine/FlowLogger';
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
 * @param logger - Optional FlowLogger instance
 */
export async function clickTextElement(
  frame: Frame,
  text: string,
  options: TextClickOptions,
  logger?: FlowLogger
): Promise<void> {
  const { fieldLabel, fieldNumber, totalFields, exact = false } = options;

  const progressInfo = fieldNumber && totalFields
    ? { field: `${fieldNumber}/${totalFields}` }
    : {};

  logger?.debug(`Clicking ${fieldLabel}`, { ...progressInfo, text });

  const element = exact
    ? frame.getByText(text, { exact: true })
    : frame.getByText(text);

  await element.waitFor({ state: 'visible', timeout: SwissLifeOneTimeouts.elementVisible });
  await element.click();
  await frame.waitForTimeout(SwissLifeOneTimeouts.afterClick);

  logger?.debug(`${fieldLabel} selected`, { text });
}
