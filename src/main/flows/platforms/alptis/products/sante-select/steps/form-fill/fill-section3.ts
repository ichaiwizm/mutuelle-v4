import type { Page } from 'playwright';
import { SECTION_3_SELECTORS } from './selectors';
import { verifyToggleState } from './verifiers';

/**
 * Section 3 - Toggle Conjoint
 */
export async function fillToggleConjoint(page: Page, shouldCheck: boolean): Promise<void> {
  console.log(`[1/1] Toggle conjoint: ${shouldCheck ? 'Oui' : 'Non'}`);

  // Usually the conjoint toggle is the second toggle on the page (first is remplacement_contrat)
  const toggleLocator = page.locator(SECTION_3_SELECTORS.toggle_conjoint.primary).nth(1);

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
