import type { Page } from 'playwright';
import { SECTION_3_SELECTORS } from './selectors/section3';
import { verifyToggleState } from './verifiers';
import { fillDateField } from './field-fillers';

/**
 * Section 3 - Toggle Conjoint
 */
export async function fillToggleConjoint(page: Page, shouldCheck: boolean): Promise<void> {
  console.log(`[1/1] Toggle conjoint: ${shouldCheck ? 'Oui' : 'Non'}`);

  // Usually the conjoint toggle is the second toggle on the page (first is remplacement_contrat)
  const toggleLocator = page.locator(SECTION_3_SELECTORS.toggle_conjoint.primary).nth(1);

  const isCurrentlyChecked = await toggleLocator.isChecked();

  if (isCurrentlyChecked !== shouldCheck) {
    // Use force: true because the label overlays the input element
    await toggleLocator.click({ force: true });
    console.log(`  ↳ Toggle cliqué (${isCurrentlyChecked ? 'décoché' : 'coché'})`);
    await page.waitForTimeout(300);
  } else {
    console.log(`  ↳ Déjà dans l'état correct`);
  }

  await verifyToggleState(page, toggleLocator, shouldCheck);
}

/**
 * Section 3 - Date de naissance du conjoint
 */
export async function fillConjointDateNaissance(page: Page, dateNaissance: string): Promise<void> {
  await fillDateField(page, dateNaissance, 2, '[1/4] Date de naissance conjoint');
}

/**
 * Section 3 - Catégorie socioprofessionnelle du conjoint
 */
export async function fillConjointCategorieSocioprofessionnelle(page: Page, value: string): Promise<void> {
  console.log(`[2/4] Catégorie conjoint: ${value}`);

  // Import dynamically to avoid circular dependency
  const { PROFESSION_LABELS } = await import('./mappers/profession-labels');
  const { verifySelectValue } = await import('./verifiers');

  const label = PROFESSION_LABELS[value as any];
  if (!label) throw new Error(`Label inconnu: ${value}`);

  const textbox = page.getByRole('textbox', { name: /catégorie socioprofessionnelle/i }).nth(1);
  await textbox.click();
  await textbox.fill(label);
  await page.waitForTimeout(500);

  await page.locator('.totem-select-option__label').filter({ hasText: label }).first().click();
  await verifySelectValue(page, page.locator(SECTION_3_SELECTORS.categorie_socioprofessionnelle.primary), value);
}

/**
 * Section 3 - Cadre d'exercice du conjoint (conditionnel)
 */
export async function fillConjointCadreExercice(page: Page, value: 'SALARIE' | 'INDEPENDANT_PRESIDENT_SASU_SAS'): Promise<void> {
  console.log(`[3/4] Cadre d'exercice conjoint: ${value}`);
  const labelText = value === 'SALARIE' ? 'Salarié' : 'Indépendant Président SASU/SAS';
  const label = page.locator(`label:has-text("${labelText}")`).nth(1); // nth(1) for conjoint (0 is adherent)
  await label.waitFor({ state: 'visible', timeout: 5000 });
  await label.click();
  console.log(`  ↳ Option "${labelText}" sélectionnée`);
}

/**
 * Section 3 - Régime obligatoire du conjoint
 */
export async function fillConjointRegimeObligatoire(page: Page, value: string): Promise<void> {
  console.log(`[4/4] Régime conjoint: ${value}`);

  const { verifySelectValue } = await import('./verifiers');

  const labels: Record<string, string> = {
    ALSACE_MOSELLE: 'Alsace / Moselle',
    AMEXA: 'Amexa',
    REGIME_SALARIES_AGRICOLES: 'Régime des salariés agricoles',
    SECURITE_SOCIALE: 'Sécurité sociale',
    SECURITE_SOCIALE_INDEPENDANTS: 'Sécurité sociale des indépendants',
  };

  const label = labels[value];
  if (!label) throw new Error(`Label inconnu: ${value}`);

  const textbox = page.getByRole('textbox', { name: /régime obligatoire/i }).nth(1); // nth(1) for conjoint
  await textbox.click();
  await textbox.fill(label);
  await page.waitForTimeout(700);

  // Match exact du texte (important: "Sécurité sociale" vs "Sécurité sociale des indépendants")
  const options = await page.locator('.totem-select-option__label:visible').all();
  for (const opt of options) {
    if ((await opt.textContent())?.trim() === label) {
      await opt.click();
      await page.waitForTimeout(300);
      await verifySelectValue(page, page.locator(SECTION_3_SELECTORS.regime_obligatoire.primary), value);
      return;
    }
  }
  throw new Error(`Option "${label}" not found`);
}
