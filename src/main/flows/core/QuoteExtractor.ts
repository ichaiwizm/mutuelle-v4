import type { Page } from 'playwright';
import type { QuoteData } from '../types/ProductTypes';

/**
 * Utility for extracting quote data from result pages.
 * Provides common patterns for quote extraction.
 */
export class QuoteExtractor {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async extractText(selector: string): Promise<string | null> {
    try {
      return await this.page.locator(selector).textContent();
    } catch {
      return null;
    }
  }

  async extractAttribute(selector: string, attribute: string): Promise<string | null> {
    try {
      return await this.page.locator(selector).getAttribute(attribute);
    } catch {
      return null;
    }
  }

  /**
   * Extract price from text (handles various formats)
   */
  parsePrice(text: string): number | null {
    const cleaned = text.replace(/[^\d,.-]/g, '');
    const normalized = cleaned.replace(',', '.');
    const price = parseFloat(normalized);
    return isNaN(price) ? null : price;
  }

  /**
   * Extract quote ID from URL
   */
  extractQuoteIdFromUrl(pattern: RegExp = /[?&]id=([^&]+)/): string | null {
    const url = this.page.url();
    const match = url.match(pattern);
    return match ? match[1] : null;
  }

  /**
   * Extract multiple fields into object
   */
  async extractFields(
    selectors: Record<string, string>
  ): Promise<Record<string, string | null>> {
    const result: Record<string, string | null> = {};

    for (const [key, selector] of Object.entries(selectors)) {
      result[key] = await this.extractText(selector);
    }

    return result;
  }

  /**
   * Build basic quote data object
   */
  async buildQuoteData(
    quoteId: string,
    priceSelector: string,
    additionalSelectors?: Record<string, string>
  ): Promise<QuoteData | null> {
    const priceText = await this.extractText(priceSelector);
    if (!priceText) return null;

    const price = this.parsePrice(priceText);
    if (price === null) return null;

    const rawData = additionalSelectors
      ? await this.extractFields(additionalSelectors)
      : {};

    return {
      quoteId,
      price,
      currency: 'EUR',
      extractedAt: new Date(),
      rawData,
    };
  }
}
