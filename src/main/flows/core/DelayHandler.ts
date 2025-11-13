import type { Page } from 'playwright';

/**
 * Utility for handling delays and progressive loading.
 * Many insurance platforms load fields/buttons progressively.
 */
export class DelayHandler {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Wait for fixed duration
   */
  async wait(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Wait for element to appear (progressive loading)
   */
  async waitForElement(
    selector: string,
    timeout: number = 10000
  ): Promise<void> {
    await this.page.waitForSelector(selector, {
      state: 'visible',
      timeout
    });
  }

  /**
   * Wait for element to disappear (loading indicator)
   */
  async waitForElementToDisappear(
    selector: string,
    timeout: number = 10000
  ): Promise<void> {
    await this.page.waitForSelector(selector, {
      state: 'hidden',
      timeout
    });
  }

  /**
   * Wait for network to be idle
   */
  async waitForNetworkIdle(timeout: number = 5000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Wait for element and ensure stability (not moving)
   */
  async waitForStableElement(
    selector: string,
    stabilityTime: number = 500
  ): Promise<void> {
    const element = await this.page.waitForSelector(selector);
    if (!element) return;

    let lastPosition = await element.boundingBox();
    await this.wait(stabilityTime);
    const currentPosition = await element.boundingBox();

    if (
      lastPosition?.x !== currentPosition?.x ||
      lastPosition?.y !== currentPosition?.y
    ) {
      // Element moved, wait again
      await this.waitForStableElement(selector, stabilityTime);
    }
  }

  /**
   * Retry action with exponential backoff
   */
  async retry<T>(
    action: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await action();
      } catch (error) {
        if (attempt === maxAttempts) throw error;
        await this.wait(baseDelay * Math.pow(2, attempt - 1));
      }
    }
    throw new Error('Retry failed');
  }
}
