/**
 * Section 4 (Enfants) form verification helpers for Santé Pro Plus
 * Identique à Santé Select
 */
import { expect, type Page } from '@playwright/test';
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
 * Verify Section 4 toggle (enfants) is set correctly
 */
export async function verifySection4Toggle(page: Page, hasEnfants: boolean): Promise<void> {
  await verifyToggle(page, 2, hasEnfants, 'enfants');
}

/**
 * Verify Section 4 enfant fields are filled correctly
 */
export async function verifySection4Enfant(page: Page, enfantData: { date_naissance: string; regime_obligatoire: string }, childIndex: number): Promise<void> {
  console.log(`\n🔍 [VERIFY] Vérification du formulaire Enfant ${childIndex + 1}...`);

  // IMPORTANT: Only the LAST child added has its accordion open and fields accessible
  // We can only verify the currently open child (the last one added)
  // For simplicity, we verify using the visible fields which belong to the open accordion

  // Date de naissance - use the last visible date field (always the currently open child)
  const dateSelector = "input[placeholder='Ex : 01/01/2020']";
  const allDateFields = page.locator(dateSelector);
  const visibleCount = await allDateFields.count();

  // The last visible date field is the currently open child
  const enfantDateInput = allDateFields.nth(visibleCount - 1);

  await verifyDateValue(page, enfantDateInput, enfantData.date_naissance);
  console.log(`✅ [VERIFY] Date de naissance enfant ${childIndex + 1}: ${enfantData.date_naissance}`);
  await expect(enfantDateInput).not.toBeFocused();
  console.log(`✅ [VERIFY] Date enfant ${childIndex + 1} blur: OK`);

  // Régime obligatoire - uses 0-based indexing for all children (has stable ID)
  const regimeSelector = `#regime-obligatoire-enfant-${childIndex}`;
  await verifySelectValue(page, page.locator(regimeSelector), enfantData.regime_obligatoire);
  console.log(`✅ [VERIFY] Régime enfant ${childIndex + 1}: ${enfantData.regime_obligatoire}`);
}
