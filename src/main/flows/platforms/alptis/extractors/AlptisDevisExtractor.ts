/**
 * Alptis Devis Extractor
 *
 * Extracts quote data from the Alptis result page after form submission.
 * The result page is a projects list page at /sante-select/projets/{projectId}
 */
import type { Page, Frame } from "playwright";
import type { FlowLogger } from "../../../engine/FlowLogger";
import type { IDevisExtractor, ExtractedDevisData } from "../../../engine/services/types";

/**
 * CSS Selectors for Alptis result page
 * Based on exploration of /sante-select/projets/{projectId}
 */
const ALPTIS_RESULT_SELECTORS = {
  // Price/tarif in the projects table
  tarif: "[class*='tarif']",
  tarifAlternative: "tr.selected td:contains('€')",

  // Project/quote reference - in the first column of the selected row
  projectLink: "tr.selected td:first-child a",
  projectLinkAlternative: "table tbody tr:first-child td:first-child a",

  // Status column
  status: "tr.selected td:last-child",

  // URL pattern for result page
  urlPattern: /\/sante-select\/projets\/(\d+)/,

  // Confirmation banner (appears after save)
  confirmationBanner: ".totem-flash--success, [class*='success']",
};

export class AlptisDevisExtractor implements IDevisExtractor {
  getResultPageSelectors() {
    return {
      priceSelector: ALPTIS_RESULT_SELECTORS.tarif,
      formulaSelector: undefined, // No specific formula name on Alptis result page
      urlPattern: ALPTIS_RESULT_SELECTORS.urlPattern.source,
    };
  }

  async extractDevisData(
    pageOrFrame: Page | Frame,
    logger?: FlowLogger
  ): Promise<ExtractedDevisData | null> {
    try {
      logger?.info("Extracting devis data from Alptis result page");

      // Get the page (handle both Page and Frame)
      const page = "url" in pageOrFrame ? pageOrFrame : (pageOrFrame as Frame).page();
      const currentUrl = page.url();

      // Extract project ID from URL
      const urlMatch = currentUrl.match(ALPTIS_RESULT_SELECTORS.urlPattern);
      const projectId = urlMatch ? urlMatch[1] : undefined;

      logger?.info("Current URL", { url: currentUrl, projectId });

      // Wait for the page to be ready (price should be visible)
      try {
        await pageOrFrame.waitForSelector(ALPTIS_RESULT_SELECTORS.tarif, {
          timeout: 10000,
        });
      } catch {
        logger?.warn("Price selector not found, trying alternative");
      }

      // Extract monthly price
      const monthlyPremium = await this.extractPrice(pageOrFrame, logger);

      // Extract quote reference from table or URL
      const quoteReference = projectId || (await this.extractQuoteReference(pageOrFrame, logger));

      // Build devis URL
      const devisUrl = currentUrl;

      // Extract status (optional)
      const status = await this.extractStatus(pageOrFrame, logger);

      const result: ExtractedDevisData = {
        monthlyPremium,
        yearlyPremium: monthlyPremium ? monthlyPremium * 12 : undefined,
        devisUrl,
        quoteReference,
        platformSpecific: {
          status,
          platform: "alptis",
          product: "sante_select",
        },
      };

      logger?.info("Devis data extracted successfully", {
        monthlyPremium,
        quoteReference,
        devisUrl,
      });

      return result;
    } catch (error) {
      logger?.error("Failed to extract devis data", error as Error);
      return null;
    }
  }

  /**
   * Extract the monthly price from the tarif column
   */
  private async extractPrice(
    pageOrFrame: Page | Frame,
    logger?: FlowLogger
  ): Promise<number | undefined> {
    try {
      const tarifElements = pageOrFrame.locator(ALPTIS_RESULT_SELECTORS.tarif);
      const count = await tarifElements.count();

      if (count > 0) {
        const priceText = await tarifElements.first().textContent();
        const price = this.parsePrice(priceText);
        logger?.info("Price extracted", { priceText, parsedPrice: price });
        return price;
      }

      // Try alternative selector
      const allText = await pageOrFrame.locator("*:has-text('€')").allTextContents();
      for (const text of allText) {
        if (text.match(/\d+[,.]?\d*\s*€/)) {
          const price = this.parsePrice(text);
          if (price && price > 0) {
            logger?.info("Price extracted via alternative", { text, parsedPrice: price });
            return price;
          }
        }
      }

      logger?.warn("No price found on page");
      return undefined;
    } catch (error) {
      logger?.warn("Error extracting price", { error });
      return undefined;
    }
  }

  /**
   * Extract quote reference from the table
   */
  private async extractQuoteReference(
    pageOrFrame: Page | Frame,
    logger?: FlowLogger
  ): Promise<string | undefined> {
    try {
      // Try to get from the first link in the table (project number)
      const projectLink = pageOrFrame.locator(ALPTIS_RESULT_SELECTORS.projectLink);
      if ((await projectLink.count()) > 0) {
        const text = await projectLink.first().textContent();
        if (text) {
          logger?.info("Quote reference extracted", { reference: text.trim() });
          return text.trim();
        }
      }

      // Try alternative
      const altLink = pageOrFrame.locator(ALPTIS_RESULT_SELECTORS.projectLinkAlternative);
      if ((await altLink.count()) > 0) {
        const text = await altLink.first().textContent();
        if (text) {
          return text.trim();
        }
      }

      return undefined;
    } catch (error) {
      logger?.warn("Error extracting quote reference", { error });
      return undefined;
    }
  }

  /**
   * Extract status from the table
   */
  private async extractStatus(
    pageOrFrame: Page | Frame,
    logger?: FlowLogger
  ): Promise<string | undefined> {
    try {
      const statusElement = pageOrFrame.locator(ALPTIS_RESULT_SELECTORS.status);
      if ((await statusElement.count()) > 0) {
        const text = await statusElement.first().textContent();
        return text?.trim();
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Parse a price string like "277,44 €" or "277.44€" to a number
   */
  private parsePrice(text: string | null): number | undefined {
    if (!text) return undefined;

    // Extract number from text like "277,44 €" or "277.44€"
    const match = text.match(/(\d+)[,.]?(\d*)\s*€/);
    if (match) {
      const intPart = match[1];
      const decPart = match[2] || "00";
      const price = parseFloat(`${intPart}.${decPart}`);
      return isNaN(price) ? undefined : price;
    }

    return undefined;
  }

  /**
   * Download PDF if available (not implemented for Alptis yet)
   * Alptis doesn't have a direct PDF download button on the result page
   */
  async downloadPdf(
    _pageOrFrame: Page | Frame,
    _targetDir: string,
    logger?: FlowLogger
  ): Promise<string | null> {
    logger?.info("PDF download not available for Alptis result page");
    // Could potentially implement via "Etude personnalisée" button in the future
    return null;
  }
}
