/**
 * Section 3 (Conjoint) form verification helpers
 */
import { expect, type Page } from '@playwright/test';
import type { AlptisFormData } from '@/main/flows/platforms/alptis/products/sante-select/transformers/types';
import {
  verifyToggleState,
  verifyDateValue,
  verifySelectValue,
} from '@/lib/playwright/form/assertions';

/**
 * Generic function to verify toggle state
 */
async function verifyToggle(page: Page, toggleIndex: number, expectedState: boolean, label: string): Promise<void> {
  console.log(`\n🔍 [VERIFY] Vérification du toggle ${label}...`);

  const toggle = toggleIndex === 0
    ? page.locator("[class*='totem-toggle__input']").first()
    : page.locator("[class*='totem-toggle__input']").nth(toggleIndex);

  await verifyToggleState(page, toggle, expectedState);
  console.log(`✅ [VERIFY] Toggle ${label}: ${expectedState ? 'Oui' : 'Non'}`);
}

/**
 * Verify Section 3 toggle (conjoint) is set correctly
 */
export async function verifySection3Toggle(page: Page, hasConjoint: boolean): Promise<void> {
  await verifyToggle(page, 1, hasConjoint, 'conjoint');
}

/**
 * Verify Section 3 conjoint fields are filled correctly
 */
export async function verifySection3Conjoint(page: Page, data: AlptisFormData['conjoint']): Promise<void> {
  if (!data) {
    console.log('⏭️ Pas de données conjoint, vérification ignorée');
    return;
  }

  console.log('\n🔍 [VERIFY] Vérification du formulaire Conjoint...');

  // Date de naissance
  const conjointDateInput = page.locator("input[placeholder='Ex : 01/01/2020']").nth(2);
  await verifyDateValue(page, conjointDateInput, data.date_naissance);
  console.log(`✅ [VERIFY] Date de naissance conjoint: ${data.date_naissance}`);
  await expect(conjointDateInput).not.toBeFocused();
  console.log('✅ [VERIFY] Date conjoint blur: OK');

  // Catégorie socioprofessionnelle
  await verifySelectValue(page, page.locator('#categories-socio-professionnelles-conjoint'), data.categorie_socioprofessionnelle);
  console.log(`✅ [VERIFY] Catégorie conjoint: ${data.categorie_socioprofessionnelle}`);

  // Cadre d'exercice (conditional)
  if (data.cadre_exercice) {
    const labelText = data.cadre_exercice === 'SALARIE' ? 'Salarié' : 'Indépendant Président SASU/SAS';
    const cadreRadio = page.locator(`label:has-text("${labelText}")`).nth(1); // nth(1) for conjoint
    await expect(cadreRadio).toBeVisible();
    console.log(`✅ [VERIFY] Cadre d'exercice conjoint: ${data.cadre_exercice} (${labelText})`);
  }

  // Régime obligatoire
  await verifySelectValue(page, page.locator('#regime-obligatoire-conjoint'), data.regime_obligatoire);
  console.log(`✅ [VERIFY] Régime conjoint: ${data.regime_obligatoire}`);
}
