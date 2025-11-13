import type { Page } from 'playwright';

/**
 * Utility for filling form fields with common patterns.
 * Provides high-level methods for typical form interactions.
 */
export class FormFieldFiller {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async fillInput(selector: string, value: string): Promise<void> {
    await this.page.locator(selector).fill(value);
  }

  async selectOption(selector: string, value: string): Promise<void> {
    await this.page.locator(selector).selectOption(value);
  }

  async selectRadio(name: string, value: string): Promise<void> {
    await this.page.locator(`input[name="${name}"][value="${value}"]`).check();
  }

  async setCheckbox(selector: string, checked: boolean): Promise<void> {
    const checkbox = this.page.locator(selector);
    checked ? await checkbox.check() : await checkbox.uncheck();
  }

  /**
   * Fill date field (handles various date input types)
   */
  async fillDate(selector: string, date: string): Promise<void> {
    const input = this.page.locator(selector);
    const type = await input.getAttribute('type');

    if (type === 'date') {
      // HTML5 date input expects YYYY-MM-DD
      await input.fill(date);
    } else {
      // Regular text input
      await input.fill(date);
    }
  }

  /**
   * Click button and wait for navigation
   */
  async clickAndWaitForNavigation(
    buttonSelector: string,
    timeout: number = 10000
  ): Promise<void> {
    await Promise.all([
      this.page.waitForLoadState('networkidle', { timeout }),
      this.page.locator(buttonSelector).click(),
    ]);
  }

  /**
   * Click button without waiting for navigation
   */
  async clickButton(selector: string): Promise<void> {
    await this.page.locator(selector).click();
  }

  /**
   * Fill multiple fields from object
   */
  async fillFields(
    fields: Record<string, string>
  ): Promise<void> {
    for (const [selector, value] of Object.entries(fields)) {
      if (value) {
        await this.fillInput(selector, value);
      }
    }
  }

  /**
   * Clear field
   */
  async clearField(selector: string): Promise<void> {
    await this.page.locator(selector).clear();
  }
}
