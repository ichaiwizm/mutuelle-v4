import type { Page, FrameLocator } from 'playwright';

/**
 * Utility for navigating and interacting with iframes.
 * Handles complex iframe structures common in insurance platforms.
 */
export class IframeNavigator {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Get iframe by selector
   */
  async getIframe(selector: string): Promise<FrameLocator> {
    await this.page.waitForSelector(selector, { state: 'attached' });
    return this.page.frameLocator(selector);
  }

  /**
   * Get nested iframe (wrapper → inner iframe)
   */
  async getNestedIframe(
    wrapperSelector: string,
    innerSelector: string
  ): Promise<FrameLocator> {
    const wrapper = await this.getIframe(wrapperSelector);
    return wrapper.frameLocator(innerSelector);
  }

  /**
   * Wait for iframe to be ready and load content
   */
  async waitForIframeReady(
    selector: string,
    contentSelector: string,
    timeout: number = 10000
  ): Promise<FrameLocator> {
    const iframe = await this.getIframe(selector);
    await iframe.locator(contentSelector).waitFor({ timeout });
    return iframe;
  }

  /**
   * Click element inside iframe
   */
  async clickInIframe(
    iframeSelector: string,
    elementSelector: string
  ): Promise<void> {
    const iframe = await this.getIframe(iframeSelector);
    await iframe.locator(elementSelector).click();
  }

  /**
   * Fill input inside iframe
   */
  async fillInIframe(
    iframeSelector: string,
    inputSelector: string,
    value: string
  ): Promise<void> {
    const iframe = await this.getIframe(iframeSelector);
    await iframe.locator(inputSelector).fill(value);
  }

  /**
   * Check if iframe exists
   */
  async iframeExists(selector: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, {
        state: 'attached',
        timeout: 2000
      });
      return true;
    } catch {
      return false;
    }
  }
}
