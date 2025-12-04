import type { BrowserContext, Page } from "playwright";

/**
 * PageLifecycleManager - Manages page creation and cleanup.
 * Creates pages from browser context and handles cleanup.
 */
export class PageLifecycleManager {
  private page: Page | null = null;
  private pageCloseHandler: (() => void) | null = null;

  constructor(private context: BrowserContext) {}

  /**
   * Create a new page from the browser context.
   */
  async createPage(workerId: string): Promise<Page> {
    console.log(`[PAGE_LIFECYCLE] Creating new page from context...`);
    const pageStart = Date.now();
    this.page = await this.context.newPage();
    console.log(`[PAGE_LIFECYCLE] Page created in ${Date.now() - pageStart}ms`);
    return this.page;
  }

  /**
   * Get the current page.
   */
  getPage(): Page | null {
    return this.page;
  }

  /**
   * Set a handler for when the page is closed externally.
   */
  onPageClose(handler: () => void): void {
    if (this.page && !this.pageCloseHandler) {
      this.pageCloseHandler = handler;
      this.page.on("close", handler);
    }
  }

  /**
   * Check if the page is still open.
   */
  isPageClosed(): boolean {
    return this.page === null || this.page.isClosed();
  }

  /**
   * Close the page and clean up.
   */
  async closePage(workerId: string): Promise<void> {
    if (this.page) {
      try {
        console.log(`[PAGE_LIFECYCLE] Closing page for worker ${workerId.substring(0, 8)}...`);
        await this.page.close();
        console.log(`[PAGE_LIFECYCLE] Page closed`);
      } catch (error) {
        console.warn(`[PAGE_LIFECYCLE] Error closing page:`, error);
        // Ignore errors during cleanup
      }
      this.page = null;
      this.pageCloseHandler = null;
    } else {
      console.log(`[PAGE_LIFECYCLE] No page to close`);
    }
  }

  /**
   * Mark page as null without closing (already closed externally).
   */
  markPageClosed(): void {
    this.page = null;
    this.pageCloseHandler = null;
  }
}
