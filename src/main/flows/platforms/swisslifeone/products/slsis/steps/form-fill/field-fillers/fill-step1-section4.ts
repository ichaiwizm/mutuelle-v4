import type { Frame } from '@playwright/test';
import { fillTextboxField } from '../operations/TextboxOperations';
import { fillSelectField } from '../operations/SelectOperations';
import { SWISSLIFE_STEP1_SELECTORS } from '../selectors';
import { SwissLifeOneTimeouts } from '../../../../../../../config';
import { mapRegimeSocialToFormLabel } from '../mappers/regime-social-form-mapper';
import { mapProfessionToFormLabel } from '../mappers/profession-form-mapper';
import type { AssurePrincipalData } from '../../../transformers/types';

/**
 * Fill "Date de naissance" field for assuré principal (Step 1, Section 4)
 * Note: This field opens a jQuery UI datepicker that needs to be closed by clicking elsewhere
 */
export async function fillDateNaissanceAssurePrincipal(
  frame: Frame,
  dateNaissance: string
): Promise<void> {
  await fillTextboxField(
    frame,
    SWISSLIFE_STEP1_SELECTORS.section4.date_naissance_assure_principal.primary,
    dateNaissance,
    {
      fieldLabel: 'Date de naissance assuré principal',
      fieldNumber: 1,
      totalFields: 1,
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
 * Fill "Département de résidence" field for assuré principal (Step 1, Section 4)
 */
export async function fillDepartementResidence(
  frame: Frame,
  departement: string
): Promise<void> {
  await fillSelectField(
    frame,
    SWISSLIFE_STEP1_SELECTORS.section4.departement_assure_principal.primary,
    departement,
    {
      fieldLabel: 'Département de résidence',
      fieldNumber: 2,
      totalFields: 4,
    }
  );
}

/**
 * Fill "Régime social" field for assuré principal (Step 1, Section 4)
 */
export async function fillRegimeSocial(
  frame: Frame,
  regimeSocial: AssurePrincipalData['regime_social']
): Promise<void> {
  const label = mapRegimeSocialToFormLabel(regimeSocial);

  // Select by label (visible text) instead of by value
  const selectElement = frame.locator(SWISSLIFE_STEP1_SELECTORS.section4.regime_social_assure_principal.primary).first();
  await selectElement.waitFor({ state: 'visible', timeout: 10000 });
  await selectElement.selectOption({ label });
  await frame.waitForTimeout(2000);

  console.log(`[3/4] Régime social: ${label}`);
  console.log(`✅ Régime social sélectionné avec succès`);
}

/**
 * Fill "Profession" field for assuré principal (Step 1, Section 4)
 */
export async function fillProfession(
  frame: Frame,
  profession: AssurePrincipalData['profession']
): Promise<void> {
  const label = mapProfessionToFormLabel(profession);

  // Select by label (visible text) instead of by value
  const selectElement = frame.locator(SWISSLIFE_STEP1_SELECTORS.section4.profession_assure_principal.primary).first();
  await selectElement.waitFor({ state: 'visible', timeout: 10000 });
  await selectElement.selectOption({ label });
  await frame.waitForTimeout(2000);

  console.log(`[4/4] Profession: ${label}`);
  console.log(`✅ Profession sélectionnée avec succès`);
}

/**
 * Fill complete Section 4: Données de l'assuré principal
 * Currently fills: date_naissance, departement_residence, regime_social, profession
 */
export async function fillSection4(
  frame: Frame,
  assurePrincipalData: AssurePrincipalData
): Promise<void> {
  console.log('\n--- Section 4: Données de l\'assuré principal ---');

  await fillDateNaissanceAssurePrincipal(frame, assurePrincipalData.date_naissance);
  await fillDepartementResidence(frame, assurePrincipalData.departement_residence);
  await fillRegimeSocial(frame, assurePrincipalData.regime_social);
  await fillProfession(frame, assurePrincipalData.profession);

  console.log('✅ Section "Données de l\'assuré principal" complétée (4/4 champs pour l\'instant)');
  console.log('---\n');
}
