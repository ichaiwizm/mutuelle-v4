/**
 * Section 2 (Adhérent) form verification helpers
 */
import { expect, type Page } from '@playwright/test';
import type { AlptisFormData } from '@/main/flows/platforms/alptis/products/sante-select/transformers/types';
import {
  verifyDateValue,
  verifyTextValue,
  verifySelectValue,
} from '@/lib/playwright/form/assertions';

/**
 * Verify Section 2 fields are filled correctly
 */
export async function verifySection2(page: Page, data: AlptisFormData): Promise<void> {
  console.log('\n🔍 [VERIFY] Vérification de la section Adhérent...');

  // Civilite (implicit via label click)
  console.log(`✅ [VERIFY] Civilité: ${data.adherent.civilite} (clicked)`);

  // Nom
  await verifyTextValue(page, page.locator('#nom'), data.adherent.nom);
  console.log(`✅ [VERIFY] Nom: ${data.adherent.nom}`);

  // Prenom
  const prenomInput = page.locator('#prenom');
  await verifyTextValue(page, prenomInput, data.adherent.prenom);
  console.log(`✅ [VERIFY] Prénom: ${data.adherent.prenom}`);

  await expect(prenomInput).not.toBeFocused();
  console.log('✅ [VERIFY] Prénom blur: OK');

  // Date naissance
  const dateNaissanceInput = page.locator("input[placeholder='Ex : 01/01/2020']").nth(1);
  await verifyDateValue(page, dateNaissanceInput, data.adherent.date_naissance);
  console.log(`✅ [VERIFY] Date de naissance: ${data.adherent.date_naissance}`);

  await expect(dateNaissanceInput).not.toBeFocused();
  console.log('✅ [VERIFY] Date naissance blur: OK');

  // Categorie socioprofessionnelle
  await verifySelectValue(page, page.locator('#categories-socio-professionnelles-adherent'), data.adherent.categorie_socioprofessionnelle);
  console.log(`✅ [VERIFY] Catégorie: ${data.adherent.categorie_socioprofessionnelle}`);

  // Cadre d'exercice (conditional)
  if (data.adherent.cadre_exercice) {
    const labelText = data.adherent.cadre_exercice === 'SALARIE' ? 'Salarié' : 'Indépendant Président SASU/SAS';
    const cadreRadio = page.locator(`label:has-text("${labelText}")`).first();
    await expect(cadreRadio).toBeVisible();
    console.log(`✅ [VERIFY] Cadre d'exercice: ${data.adherent.cadre_exercice} (${labelText})`);
  }

  // Regime obligatoire
  await verifySelectValue(page, page.locator('#regime-obligatoire-adherent'), data.adherent.regime_obligatoire);
  console.log(`✅ [VERIFY] Régime: ${data.adherent.regime_obligatoire}`);

  // Code postal
  await verifyTextValue(page, page.locator('input#codePostal'), data.adherent.code_postal);
  console.log(`✅ [VERIFY] Code postal: ${data.adherent.code_postal}`);
}
