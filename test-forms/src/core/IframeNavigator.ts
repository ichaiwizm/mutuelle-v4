import { Page, FrameLocator } from '@playwright/test';

/**
 * Navigator pour gérer les iframes dans les tests Playwright
 * Permet d'attendre, de naviguer et d'interagir avec les éléments dans les iframes
 */
export class IframeNavigator {
  constructor(private page: Page) {}

  /**
   * Récupère un iframe par son sélecteur et attend qu'il soit chargé
   */
  async getIframe(selector: string, timeout: number = 10000): Promise<FrameLocator> {
    await this.page.waitForSelector(selector, { state: 'attached', timeout });
    const iframe = this.page.frameLocator(selector);

    // Attendre que l'iframe soit réellement chargé
    await this.page.waitForTimeout(100);

    return iframe;
  }

  /**
   * Attend qu'un élément soit visible dans un iframe
   */
  async waitForIframeElement(
    iframe: FrameLocator,
    selector: string,
    timeout: number = 10000
  ): Promise<void> {
    await iframe.locator(selector).waitFor({ state: 'visible', timeout });
  }

  /**
   * Clique sur un élément dans un iframe
   */
  async clickInIframe(iframe: FrameLocator, selector: string): Promise<void> {
    await iframe.locator(selector).click();
  }

  /**
   * Remplit un champ dans un iframe
   */
  async fillInIframe(iframe: FrameLocator, selector: string, value: string): Promise<void> {
    await iframe.locator(selector).fill(value);
  }

  /**
   * Sélectionne une option dans un select dans un iframe
   */
  async selectInIframe(iframe: FrameLocator, selector: string, value: string): Promise<void> {
    await iframe.locator(selector).selectOption(value);
  }

  /**
   * Vérifie si un élément existe dans un iframe
   */
  async elementExistsInIframe(iframe: FrameLocator, selector: string): Promise<boolean> {
    try {
      await iframe.locator(selector).waitFor({ state: 'attached', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Récupère le texte d'un élément dans un iframe
   */
  async getTextFromIframe(iframe: FrameLocator, selector: string): Promise<string> {
    return await iframe.locator(selector).textContent() || '';
  }

  /**
   * Coche/décoche une checkbox dans un iframe
   */
  async checkInIframe(iframe: FrameLocator, selector: string, checked: boolean = true): Promise<void> {
    if (checked) {
      await iframe.locator(selector).check();
    } else {
      await iframe.locator(selector).uncheck();
    }
  }

  /**
   * Sélectionne un bouton radio dans un iframe
   */
  async selectRadioInIframe(iframe: FrameLocator, name: string, value: string): Promise<void> {
    await iframe.locator(`input[type="radio"][name="${name}"][value="${value}"]`).check();
  }
}
