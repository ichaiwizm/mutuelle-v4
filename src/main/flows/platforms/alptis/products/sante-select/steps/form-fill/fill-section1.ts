import type { Page } from 'playwright';
import { SECTION_1_SELECTORS } from './selectors';
import { verifyToggleState, verifyRadioSelection } from './verifiers';
import { fillDateField } from './field-fillers';

/**
 * Section 1 - Remplacement d'un contrat
 */
export async function fillRemplacementContrat(page: Page, shouldCheck: boolean): Promise<void> {
  console.log(`[1/3] Remplacement contrat: ${shouldCheck ? 'Oui' : 'Non'}`);

  const toggleLocator = page.locator(SECTION_1_SELECTORS.remplacement_contrat.primary).first();
  const isCurrentlyChecked = await toggleLocator.isChecked();

  if (isCurrentlyChecked !== shouldCheck) {
    await toggleLocator.click();
    console.log(`  ↳ Toggle cliqué (${isCurrentlyChecked ? 'décoché' : 'coché'})`);
    await page.waitForTimeout(300);
  } else {
    console.log(`  ↳ Déjà dans l'état correct`);
  }

  await verifyToggleState(page, toggleLocator, shouldCheck);
}

/**
 * Section 1 - Demande de résiliation (conditionnel)
 */
export async function fillDemandeResiliation(page: Page, value: 'Oui' | 'Non'): Promise<void> {
  console.log(`[2/3] Demande résiliation: ${value}`);
  console.log(`  ↳ Champ conditionnel activé`);

  const radioSelector = SECTION_1_SELECTORS.demande_resiliation.primary;
  await page.waitForSelector(radioSelector, { state: 'visible', timeout: 5000 });
  console.log(`  ↳ Champ visible`);

  const radioLocator = page.locator(SECTION_1_SELECTORS.demande_resiliation.byValue(value));
  await radioLocator.click();
  console.log(`  ↳ Option "${value}" sélectionnée`);

  await verifyRadioSelection(page, radioLocator, value);
}

/**
 * Section 1 - Date d'effet
 */
export async function fillDateEffet(page: Page, dateEffet: string): Promise<void> {
  await fillDateField(page, dateEffet, 0, '[3/3] Date d\'effet');
}


