import type { Frame } from '@playwright/test';
import { fillTextboxField } from '../operations/TextboxOperations';
import { SWISSLIFE_STEP1_SELECTORS } from '../selectors';
import { SwissLifeOneTimeouts } from '../../../../../../../config';
import { mapRegimeSocialToFormLabel } from '../mappers/regime-social-form-mapper';
import { mapProfessionToFormLabel } from '../mappers/profession-form-mapper';
import { mapStatutToFormLabel } from '../mappers/statut-form-mapper';
import type { ConjointData } from '../../../transformers/types';

/**
 * Fill "Date de naissance" field for conjoint (Step 1, Section 5)
 * Note: This field opens a jQuery UI datepicker that needs to be closed by clicking elsewhere
 */
export async function fillDateNaissanceConjoint(
  frame: Frame,
  dateNaissance: string
): Promise<void> {
  await fillTextboxField(
    frame,
    SWISSLIFE_STEP1_SELECTORS.section5.date_naissance_conjoint.primary,
    dateNaissance,
    {
      fieldLabel: 'Date de naissance conjoint',
      fieldNumber: 1,
      totalFields: 4,
    }
  );

  // Close the datepicker by clicking elsewhere on the page
  // The datepicker (#ui-datepicker-div) remains open after typing and needs to be dismissed
  const datepicker = frame.locator('#ui-datepicker-div');
  const isVisible = await datepicker.isVisible().catch(() => false);

  if (isVisible) {
    // Click on the page body to close the datepicker
    await frame.locator('body').click({ position: { x: 10, y: 10 } });

    // Wait for the datepicker to actually disappear
    await datepicker.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {
      console.log('⚠️  Datepicker still visible after click');
    });

    await frame.waitForTimeout(SwissLifeOneTimeouts.afterClick);
    console.log('✅ Datepicker fermé');
  }
}

/**
 * Fill "Régime social" field for conjoint (Step 1, Section 5)
 */
export async function fillRegimeSocialConjoint(
  frame: Frame,
  regimeSocial: ConjointData['regime_social']
): Promise<void> {
  const label = mapRegimeSocialToFormLabel(regimeSocial);

  // Select by label (visible text) instead of by value
  const selectElement = frame.locator(SWISSLIFE_STEP1_SELECTORS.section5.regime_social_conjoint.primary).first();
  await selectElement.waitFor({ state: 'visible', timeout: 10000 });
  await selectElement.selectOption({ label });
  await frame.waitForTimeout(2000);

  console.log(`[2/4] Régime social conjoint: ${label}`);
  console.log(`✅ Régime social conjoint sélectionné avec succès`);
}

/**
 * Fill "Profession" field for conjoint (Step 1, Section 5)
 */
export async function fillProfessionConjoint(
  frame: Frame,
  profession: ConjointData['profession']
): Promise<void> {
  const label = mapProfessionToFormLabel(profession);

  // Select by label (visible text) instead of by value
  const selectElement = frame.locator(SWISSLIFE_STEP1_SELECTORS.section5.profession_conjoint.primary).first();
  await selectElement.waitFor({ state: 'visible', timeout: 10000 });
  await selectElement.selectOption({ label });
  await frame.waitForTimeout(2000);

  console.log(`[3/4] Profession conjoint: ${label}`);
  console.log(`✅ Profession conjoint sélectionnée avec succès`);
}

/**
 * Fill "Statut" field for conjoint (Step 1, Section 5)
 * Note: Unlike assuré principal, conjoint's statut options are pre-loaded (not dynamic)
 */
export async function fillStatutConjoint(
  frame: Frame,
  statut: ConjointData['statut'],
  regime: ConjointData['regime_social']
): Promise<void> {
  const label = mapStatutToFormLabel(statut, regime);

  // Wait for the statut field to be visible
  const selectElement = frame.locator(SWISSLIFE_STEP1_SELECTORS.section5.statut_conjoint.primary).first();
  await selectElement.waitFor({ state: 'visible', timeout: 10000 });

  // Wait for the specific option we want to select to be loaded and enabled
  // For conjoint, options are pre-loaded but we still check to be safe
  await frame.locator(`#statut-assure-conjoint option:has-text("${label}"):not([disabled])`).waitFor({
    state: 'attached',
    timeout: 10000
  });

  // Select by label (visible text) instead of by value
  await selectElement.selectOption({ label });
  await frame.waitForTimeout(2000);

  console.log(`[4/4] Statut conjoint: ${label}`);
  console.log(`✅ Statut conjoint sélectionné avec succès`);
}

/**
 * Fill complete Section 5: Données du conjoint
 * Fills: date_naissance, regime_social, profession, statut (4 fields total)
 * Note: No departement field for conjoint
 */
export async function fillSection5(
  frame: Frame,
  conjointData: ConjointData
): Promise<void> {
  console.log('\n--- Section 5: Données du conjoint ---');

  // First, click on the "Conjoint" tab to switch from "Assuré principal"
  console.log('🔄 Passage à l\'onglet Conjoint...');
  await frame.getByRole('link', { name: SWISSLIFE_STEP1_SELECTORS.section5.conjoint_tab.primary }).click();
  await frame.waitForTimeout(SwissLifeOneTimeouts.afterClick);
  console.log('✅ Onglet Conjoint activé');

  await fillDateNaissanceConjoint(frame, conjointData.date_naissance);
  await fillRegimeSocialConjoint(frame, conjointData.regime_social);
  await fillProfessionConjoint(frame, conjointData.profession);
  await fillStatutConjoint(frame, conjointData.statut, conjointData.regime_social);

  console.log('✅ Section "Données du conjoint" complétée (4/4 champs)');
  console.log('---\n');
}
