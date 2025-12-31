/**
 * Submit step for Entoria Pack Famille
 * Final submission and step navigation
 */
import type { Page } from 'playwright';
import { SELECTORS } from '../selectors';

export interface StepResult {
  success: boolean;
  error?: string;
}

/**
 * Submit profil step (Step 1) - click CONTINUER
 */
export async function submitProfil(page: Page): Promise<StepResult> {
  try {
    const continuerBtn = page.getByRole('button', { name: /continuer/i });
    await continuerBtn.waitFor({ state: 'visible', timeout: 5000 });

    // Wait for button to be enabled (Angular validation)
    await page.waitForFunction(
      () => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent?.toUpperCase().includes('CONTINUER'));
        return btn && !btn.disabled;
      },
      { timeout: 10000 }
    );

    await continuerBtn.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Submit besoin step (Step 2) - click suivant
 */
export async function submitBesoin(page: Page): Promise<StepResult> {
  try {
    const suivantBtn = page.locator(SELECTORS.besoin.suivant);
    await suivantBtn.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Submit garanties step (Step 3) - click suivant to get devis
 */
export async function submitGaranties(page: Page): Promise<StepResult> {
  try {
    const suivantBtn = page.locator(SELECTORS.garanties.suivant);
    await suivantBtn.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/** Submit step definition */
export const submitStep = {
  id: 'entoria-submit',
  name: 'Submit Form',
  type: 'custom' as const,
  submitProfil,
  submitBesoin,
  submitGaranties,
};
