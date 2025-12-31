/**
 * Besoin step for Entoria Pack Famille (Step 2)
 * Hospitalisation OUI/NON button selection
 */
import type { Page } from 'playwright';
import type { PackFamilleFormData } from '../types';
import { SELECTORS } from '../selectors';

export interface StepResult {
  success: boolean;
  error?: string;
}

/**
 * Execute besoin step - select hospitalisation preference
 */
export async function executeBesoin(
  page: Page,
  data: PackFamilleFormData
): Promise<StepResult> {
  try {
    const { besoin } = data;
    const sel = SELECTORS.besoin;

    // Select hospitalisation button (OUI or NON)
    const btnSelector = besoin.hospitalisation_uniquement
      ? sel.hospitalisation_oui
      : sel.hospitalisation_non;

    const btn = page.locator(btnSelector).first();
    await btn.waitFor({ state: 'visible', timeout: 5000 });
    await btn.click();

    await page.waitForTimeout(1000);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Submit besoin step - click suivant to go to step 3
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

/** Besoin step definition */
export const besoinStep = {
  id: 'entoria-besoin',
  name: 'Fill Besoin (Step 2)',
  type: 'form-fill' as const,
  execute: executeBesoin,
  submit: submitBesoin,
};
