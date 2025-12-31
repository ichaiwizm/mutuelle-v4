/**
 * Profil step for Entoria Pack Famille (Step 1)
 */
import type { Page } from 'playwright';
import type { PackFamilleFormData } from '../types';
import { SELECTORS } from '../selectors';

export interface StepResult { success: boolean; error?: string; }

/** Fill profession autocomplete with retry */
async function fillProfession(page: Page, profession: string): Promise<void> {
  const input = page.locator(SELECTORS.profil.profession).first();
  await input.click();
  await input.clear();
  const exactOption = page.locator(`mat-option:has-text("${profession}")`).first();

  // Try progressively shorter search terms
  for (const searchText of [profession.substring(0, 20), profession.split(',')[0].trim(), profession.substring(0, 5)]) {
    await input.clear();
    await page.waitForTimeout(500);
    await input.pressSequentially(searchText, { delay: 80 });
    await page.waitForTimeout(2000);
    if (await exactOption.isVisible().catch(() => false)) {
      await exactOption.click();
      return;
    }
  }
  throw new Error(`Profession "${profession}" not found`);
}

/** Execute profil step */
export async function executeProfil(page: Page, data: PackFamilleFormData): Promise<StepResult> {
  try {
    const { profil } = data;
    const sel = SELECTORS.profil;

    // 1. Date de naissance
    const dateInput = page.locator(sel.date_naissance).first();
    await dateInput.waitFor({ state: 'visible', timeout: 10000 });
    await dateInput.fill(profil.date_naissance);

    // 2. Profession (autocomplete)
    await fillProfession(page, profil.profession);
    await page.waitForTimeout(1000);

    // 3. Exerce en tant que (conditional)
    const exerceInput = page.locator(sel.exerce_en_tant_que).first();
    if (await exerceInput.isVisible()) {
      await exerceInput.click();
      await page.waitForTimeout(500);
      const opt = page.locator(SELECTORS.common.mat_option).first();
      if (await opt.isVisible()) await opt.click();
    }
    await page.waitForTimeout(500);

    // 4. Departement (mat-select)
    const deptSelect = page.locator(sel.departement).first();
    await deptSelect.click();
    await page.waitForTimeout(500);
    const deptOpt = page.locator(`mat-option:has-text("${profil.departement_residence}")`).first();
    if (await deptOpt.isVisible()) await deptOpt.click();
    else {
      await page.keyboard.type(profil.departement_residence);
      await page.waitForTimeout(500);
      await page.locator(SELECTORS.common.mat_option).first().click();
    }

    // 5. Prevoyance Entoria (radio)
    const prevSel = profil.assure_prevoyance_entoria ? sel.prevoyance.oui : sel.prevoyance.non;
    await page.locator(prevSel).first().click();
    await page.waitForTimeout(1000);

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export const profilStep = {
  id: 'entoria-profil',
  name: 'Fill Profil (Step 1)',
  type: 'form-fill' as const,
  execute: executeProfil,
};
