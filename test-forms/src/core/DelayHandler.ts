import { Page } from '@playwright/test';

export interface DelayConfig {
  minDelay: number;
  maxDelay: number;
  checkInterval: number;
}

/**
 * Gestionnaire de délais pour attendre des éléments qui apparaissent progressivement
 * Utile pour les composants qui se chargent avec un délai (ex: lazy loading)
 */
export class DelayHandler {
  constructor(private page: Page) {}

  /**
   * Attend qu'un élément apparaisse après un délai spécifique
   * @param selector Sélecteur de l'élément
   * @param expectedDelay Délai attendu en ms
   * @param maxTimeout Timeout maximum en ms
   */
  async waitForDelayedElement(
    selector: string,
    expectedDelay: number,
    maxTimeout: number = 10000
  ): Promise<void> {
    // Attendre le délai attendu
    await this.page.waitForTimeout(expectedDelay);

    // Puis attendre que l'élément soit visible
    await this.page.waitForSelector(selector, {
      state: 'visible',
      timeout: maxTimeout - expectedDelay
    });
  }

  /**
   * Attend le chargement progressif de plusieurs éléments
   * @param selectors Liste de sélecteurs avec leurs délais
   * @param maxTimeout Timeout total maximum
   */
  async waitForProgressiveLoad(
    selectors: Array<{ selector: string; delay: number }>,
    maxTimeout: number = 15000
  ): Promise<void> {
    const startTime = Date.now();

    for (const { selector, delay } of selectors) {
      const elapsed = Date.now() - startTime;
      const remainingTimeout = maxTimeout - elapsed;

      if (remainingTimeout <= 0) {
        throw new Error(`Timeout waiting for progressive load at selector: ${selector}`);
      }

      await this.waitForDelayedElement(selector, delay, remainingTimeout);
    }
  }

  /**
   * Attend avec une stratégie de retry (utile pour les éléments instables)
   * @param selector Sélecteur de l'élément
   * @param config Configuration des délais
   */
  async waitWithRetry(selector: string, config: DelayConfig): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < config.maxDelay) {
      try {
        await this.page.waitForSelector(selector, {
          state: 'visible',
          timeout: config.checkInterval
        });
        return; // Succès
      } catch {
        // Attendre avant de réessayer
        await this.page.waitForTimeout(config.checkInterval);
      }
    }

    throw new Error(`Element ${selector} not found after ${config.maxDelay}ms with retries`);
  }

  /**
   * Attend qu'un élément soit stable (ne bouge plus)
   * Utile pour les animations
   */
  async waitForStability(selector: string, stabilityDuration: number = 500): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'visible' });

    // Attendre que l'élément ne bouge plus pendant stabilityDuration ms
    let lastPosition: { x: number; y: number } | null = null;
    const startTime = Date.now();

    while (Date.now() - startTime < stabilityDuration * 3) {
      const element = await this.page.locator(selector).boundingBox();

      if (!element) {
        throw new Error(`Element ${selector} not found`);
      }

      if (lastPosition) {
        const moved = lastPosition.x !== element.x || lastPosition.y !== element.y;

        if (!moved) {
          // L'élément n'a pas bougé, attendre stabilityDuration
          await this.page.waitForTimeout(stabilityDuration);

          // Vérifier à nouveau
          const finalElement = await this.page.locator(selector).boundingBox();
          if (finalElement && finalElement.x === element.x && finalElement.y === element.y) {
            return; // Stable !
          }
        }
      }

      lastPosition = { x: element.x, y: element.y };
      await this.page.waitForTimeout(100);
    }

    throw new Error(`Element ${selector} did not stabilize after ${stabilityDuration * 3}ms`);
  }
}
