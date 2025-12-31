/**
 * Garanties step for Entoria Pack Famille (Step 3)
 */
import type { Page } from 'playwright';
import type { PackFamilleFormData } from '../types';
import { SELECTORS } from '../selectors';

export interface StepResult { success: boolean; error?: string; }

/** Dismiss date effet error modal if present */
async function dismissDateModal(page: Page): Promise<void> {
  try {
    const okBtn = page.getByRole('button', { name: 'OK' });
    if (await okBtn.isVisible({ timeout: 1000 })) {
      await okBtn.click();
      await page.waitForTimeout(500);
    }
  } catch { /* No modal */ }
}

/** Execute garanties step */
export async function executeGaranties(page: Page, data: PackFamilleFormData): Promise<StepResult> {
  try {
    const { garanties } = data;
    const sel = SELECTORS.garanties;
    await page.waitForTimeout(1000);

    // 1. Frequence de reglement (radio)
    const freqSel = garanties.frequence_reglement === 'Mensuelle' ? sel.frequence.mensuelle : sel.frequence.trimestrielle;
    await page.locator(freqSel).first().click();

    // 2. Date d'effet
    const dateInput = page.locator(sel.date_effet).first();
    if (await dateInput.isVisible()) {
      const currentVal = await dateInput.inputValue();
      if (!currentVal || currentVal !== garanties.date_effet) {
        await dateInput.clear();
        await dateInput.fill(garanties.date_effet);
        await page.keyboard.press('Tab');
        await page.waitForTimeout(500);
        await dismissDateModal(page);
      }
    }
    await page.waitForTimeout(1000);

    // 3. Add conjoint if needed
    if (garanties.avec_conjoint) {
      const conjointBtn = page.getByRole('button', { name: 'Son conjoint' });
      if (await conjointBtn.isVisible({ timeout: 2000 })) {
        await conjointBtn.click({ force: true });
        await page.waitForTimeout(2000);
      }
    }

    // 4. Add enfants if needed
    if (garanties.avec_enfants) {
      const enfantsBtn = page.getByRole('button', { name: /enfant/i });
      if (await enfantsBtn.isVisible({ timeout: 2000 })) {
        await enfantsBtn.click({ force: true });
        await page.waitForTimeout(2000);
      }
    }

    // 5. Select formule (default: ESSENTIEL_PRO)
    if (garanties.formule_choisie && garanties.formule_choisie !== 'ESSENTIEL_PRO') {
      const formuleKey = garanties.formule_choisie.toLowerCase().replace('_', '_') as keyof typeof sel.formules;
      const formuleSelector = sel.formules[formuleKey];
      if (formuleSelector) {
        const cell = page.locator(formuleSelector).first();
        if (await cell.isVisible({ timeout: 2000 })) await cell.click();
      }
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export const garantiesStep = {
  id: 'entoria-garanties',
  name: 'Fill Garanties (Step 3)',
  type: 'form-fill' as const,
  execute: executeGaranties,
};
