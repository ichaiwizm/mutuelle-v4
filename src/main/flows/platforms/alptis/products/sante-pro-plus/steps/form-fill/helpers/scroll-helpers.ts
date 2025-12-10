import type { Page } from 'playwright';
import type { FlowLogger } from '../../../../../../../engine/FlowLogger';
import { AlptisTimeouts } from '../../../../../../../config';

/**
 * Scroll to a section on the page by keyword
 * @param page - Playwright page object
 * @param sectionKeyword - Keyword to find in section title (h2, h3, div)
 * @param logger - Optional FlowLogger for debugging
 */
export async function scrollToSection(page: Page, sectionKeyword: string, logger?: FlowLogger): Promise<void> {
  logger?.debug?.(`Scrolling to section: ${sectionKeyword}`);
  await page.evaluate((keyword) => {
    const section = Array.from(document.querySelectorAll('h2, h3, div'))
      .find(el => el.textContent?.includes(keyword));
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, sectionKeyword);
  await page.waitForTimeout(AlptisTimeouts.scroll);
}
