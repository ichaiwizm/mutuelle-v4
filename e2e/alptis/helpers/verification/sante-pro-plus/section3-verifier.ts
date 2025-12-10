/**
 * Section 3 (Conjoint) form verification helpers for Santé Pro Plus
 * SIMPLIFIÉ: Pas de cadre_exercice pour le conjoint
 */
import { expect, type Page } from '@playwright/test';
import type { SanteProPlusFormData } from '@/main/flows/platforms/alptis/products/sante-pro-plus/transformers/types';
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

  const toggle = page.getByRole('checkbox').nth(toggleIndex);

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
 * NOTE: Santé Pro Plus n'a PAS de cadre_exercice pour le conjoint
 */
export async function verifySection3Conjoint(page: Page, data: SanteProPlusFormData['conjoint']): Promise<void> {
  if (!data) {
    console.log('⏭️ Pas de données conjoint, vérification ignorée');
    return;
  }

  console.log('\n🔍 [VERIFY] Vérification du formulaire Conjoint (Santé Pro Plus - simplifié)...');

  // Date de naissance - Use .last() for robustness in bulk tests
  const conjointDateInput = page.locator("input[placeholder='Ex : 01/01/2020']").last();
  await verifyDateValue(page, conjointDateInput, data.date_naissance);
  console.log(`✅ [VERIFY] Date de naissance conjoint: ${data.date_naissance}`);
  await expect(conjointDateInput).not.toBeFocused();
  console.log('✅ [VERIFY] Date conjoint blur: OK');

  // Catégorie socioprofessionnelle
  await verifySelectValue(page, page.locator('#categories-socio-professionnelles-conjoint'), data.categorie_socioprofessionnelle);
  console.log(`✅ [VERIFY] Catégorie conjoint: ${data.categorie_socioprofessionnelle}`);

  // PAS de cadre_exercice pour le conjoint dans Santé Pro Plus
  console.log('ℹ️ [VERIFY] Cadre d\'exercice conjoint: N/A (Santé Pro Plus)');

  // Régime obligatoire
  await verifySelectValue(page, page.locator('#regime-obligatoire-conjoint'), data.regime_obligatoire);
  console.log(`✅ [VERIFY] Régime conjoint: ${data.regime_obligatoire}`);
}
