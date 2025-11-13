import type { Page } from 'playwright';

/**
 * Utility for handling conditional fields that appear/disappear
 * based on other field values.
 */
export class ConditionalFieldHandler {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async isFieldVisible(selector: string): Promise<boolean> {
    try {
      return await this.page.locator(selector).isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Fill field only if it's visible
   */
  async fillIfVisible(
    selector: string,
    value: string,
    timeout: number = 2000
  ): Promise<boolean> {
    try {
      const visible = await this.isFieldVisible(selector);
      if (visible) {
        await this.page.locator(selector).fill(value, { timeout });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Wait for conditional field to appear after triggering action
   */
  async waitForConditionalField(
    triggerSelector: string,
    triggerValue: string,
    conditionalSelector: string,
    timeout: number = 5000
  ): Promise<boolean> {
    // Fill trigger field
    await this.page.locator(triggerSelector).fill(triggerValue);

    // Wait for conditional field
    try {
      await this.page.waitForSelector(conditionalSelector, {
        state: 'visible',
        timeout,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Select option and wait for conditional fields
   */
  async selectAndWaitForConditional(
    selectSelector: string,
    optionValue: string,
    conditionalSelector: string,
    timeout: number = 5000
  ): Promise<boolean> {
    await this.page.locator(selectSelector).selectOption(optionValue);

    try {
      await this.page.waitForSelector(conditionalSelector, {
        state: 'visible',
        timeout,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Handle dynamic field groups (e.g., adding children)
   */
  async addDynamicField(
    addButtonSelector: string,
    fieldGroupSelector: string
  ): Promise<void> {
    await this.page.locator(addButtonSelector).click();
    await this.page.waitForSelector(fieldGroupSelector, { state: 'visible' });
  }
}
