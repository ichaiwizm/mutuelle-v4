import type { Page, Frame } from 'playwright';
import type { FlowLogger } from '../../../../../engine/FlowLogger';
import {
  SwissLifeOneUrls,
  SwissLifeOneSelectors,
  SwissLifeOneTimeouts,
} from '../../../../../../config';
import { setupCookieInterception } from '../../../../lib/cookie-interceptor';

/**
 * Étape de navigation vers le formulaire SLSIS
 * Note: L'iframe prend 45+ secondes à charger (backend très lent)
 */
export class SwissLifeNavigationStep {
  private logger?: FlowLogger;

  async execute(page: Page, logger?: FlowLogger): Promise<void> {
    this.logger = logger;
    // Note: Le bandeau de cookies (OneTrust) doit être bloqué dans le test avant le login pour persister pendant toute la session
    await setupCookieInterception(page, { debug: process.env.SWISSLIFE_DEBUG_COOKIES === '1' });
    await this.navigateToForm(page);
    await this.waitForIframeLoad(page);
  }

  private async navigateToForm(page: Page): Promise<void> {
    await page.goto(SwissLifeOneUrls.slsisForm, {
      waitUntil: 'networkidle',
      timeout: SwissLifeOneTimeouts.navigationIdle,
    });
  }

  private async waitForIframeLoad(page: Page): Promise<void> {
    await page.waitForSelector(SwissLifeOneSelectors.iframe, {
      state: 'attached',
      timeout: SwissLifeOneTimeouts.iframeAppear,
    });

    const frame = await this.getIframe(page);

    this.logger?.debug('Iframe attached', { url: frame.url() });

    // Vérifier que l'iframe a une URL réelle (pas about:blank)
    if (frame.url() === 'about:blank' || frame.url() === '') {
      this.logger?.debug('Iframe is blank, waiting for content...');
      await page.waitForTimeout(2000);
    }

    // Attendre que l'iframe soit complètement chargée (load complet, pas juste DOM)
    await frame.waitForLoadState('load', {
      timeout: SwissLifeOneTimeouts.iframeReady,
    });

    this.logger?.debug('Iframe loaded', { url: frame.url() });

    await this.waitForLoaderToDisappear(frame);
  }

  private async waitForLoaderToDisappear(frame: Frame): Promise<void> {
    try {
      const loader = frame.locator(SwissLifeOneSelectors.loader);
      const loaderCount = await loader.count();

      if (loaderCount > 0) {
        await loader.waitFor({
          state: 'hidden',
          timeout: SwissLifeOneTimeouts.elementVisible,
        });
      }
    } catch {
      // Loader peut ne pas exister
    }
  }

  async getIframe(page: Page): Promise<Frame> {
    let frame = page.frame({ name: SwissLifeOneSelectors.iframeName });

    if (!frame) {
      const iframeElement = await page.locator(SwissLifeOneSelectors.iframe).elementHandle();
      if (iframeElement) {
        frame = await iframeElement.contentFrame();
      }
    }

    if (!frame) {
      const frames = page.frames();
      frame = frames.length > 1 ? frames[1] : null;
    }

    if (!frame) {
      throw new Error('Impossible de trouver l\'iframe du formulaire SLSIS');
    }

    return frame;
  }

  async isFormReady(page: Page): Promise<boolean> {
    try {
      const frame = await this.getIframe(page);
      const firstField = frame.getByRole(SwissLifeOneSelectors.firstField).first();
      return await firstField.isVisible();
    } catch {
      return false;
    }
  }
}
