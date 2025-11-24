import type { Frame } from '@playwright/test';
import type { FlowLogger } from '../../../../../../engine/FlowLogger';
import { fillTextboxField } from '../operations/TextboxOperations';
import { fillSelectField } from '../operations/SelectOperations';
import { SWISSLIFE_STEP1_SELECTORS } from '../selectors';
import { SwissLifeOneTimeouts } from '../../../../../../../config';
import { mapRegimeSocialToFormLabel } from '../mappers/regime-social-form-mapper';
import { mapProfessionToFormLabel } from '../mappers/profession-form-mapper';
import { mapStatutToFormLabel } from '../mappers/statut-form-mapper';
import type { AssurePrincipalData } from '../../../transformers/types';

/**
 * Fill "Date de naissance" field for assuré principal (Step 1, Section 4)
 * Note: This field opens a jQuery UI datepicker that needs to be closed by clicking elsewhere
 */
export async function fillDateNaissanceAssurePrincipal(
  frame: Frame,
  dateNaissance: string,
  logger?: FlowLogger
): Promise<void> {
  await fillTextboxField(
    frame,
    SWISSLIFE_STEP1_SELECTORS.section4.date_naissance_assure_principal.primary,
    dateNaissance,
    {
      fieldLabel: 'Date de naissance assuré principal',
      fieldNumber: 1,
      totalFields: 1,
    },
    logger
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
      logger?.warn('Datepicker still visible after click');
    });

    await frame.waitForTimeout(SwissLifeOneTimeouts.afterClick);
    logger?.debug('Datepicker closed');
  }
}

/**
 * Fill "Département de résidence" field for assuré principal (Step 1, Section 4)
 */
export async function fillDepartementResidence(
  frame: Frame,
  departement: string,
  logger?: FlowLogger
): Promise<void> {
  await fillSelectField(
    frame,
    SWISSLIFE_STEP1_SELECTORS.section4.departement_assure_principal.primary,
    departement,
    {
      fieldLabel: 'Département de résidence',
      fieldNumber: 2,
      totalFields: 4,
    },
    logger
  );
}

/**
 * Fill "Régime social" field for assuré principal (Step 1, Section 4)
 */
export async function fillRegimeSocial(
  frame: Frame,
  regimeSocial: AssurePrincipalData['regime_social'],
  logger?: FlowLogger
): Promise<void> {
  const label = mapRegimeSocialToFormLabel(regimeSocial);

  logger?.debug('Filling régime social', { label, field: '3/4' });

  // Select by label (visible text) instead of by value
  const selectElement = frame.locator(SWISSLIFE_STEP1_SELECTORS.section4.regime_social_assure_principal.primary).first();
  await selectElement.waitFor({ state: 'visible', timeout: 10000 });
  await selectElement.selectOption({ label });
  await frame.waitForTimeout(2000);

  logger?.debug('Régime social selected', { label });
}

/**
 * Fill "Profession" field for assuré principal (Step 1, Section 4)
 */
export async function fillProfession(
  frame: Frame,
  profession: AssurePrincipalData['profession'],
  logger?: FlowLogger
): Promise<void> {
  const label = mapProfessionToFormLabel(profession);

  logger?.debug('Filling profession', { label, field: '4/5' });

  // Select by label (visible text) instead of by value
  const selectElement = frame.locator(SWISSLIFE_STEP1_SELECTORS.section4.profession_assure_principal.primary).first();
  await selectElement.waitFor({ state: 'visible', timeout: 10000 });
  await selectElement.selectOption({ label });
  await frame.waitForTimeout(2000);

  logger?.debug('Profession selected', { label });
}

/**
 * Fill "Statut" field for assuré principal (Step 1, Section 4)
 * Note: This field loads dynamically after regime_social + profession selection
 * The available options vary based on the regime_social selected
 */
export async function fillStatut(
  frame: Frame,
  statut: AssurePrincipalData['statut'],
  regime: AssurePrincipalData['regime_social'],
  logger?: FlowLogger
): Promise<void> {
  const label = mapStatutToFormLabel(statut, regime);

  logger?.debug('Filling statut', { label, field: '5/5' });

  // Wait for the statut field to appear (it loads dynamically after profession)
  const selectElement = frame.locator(SWISSLIFE_STEP1_SELECTORS.section4.statut_assure_principal.primary).first();
  await selectElement.waitFor({ state: 'visible', timeout: 10000 });

  // Wait for the specific option we want to select to be loaded and enabled
  // The options are populated via AJAX after profession selection
  await frame.locator(`#statut-assure-principal option:has-text("${label}"):not([disabled])`).waitFor({
    state: 'attached',
    timeout: 10000
  });

  // Select by label (visible text) instead of by value
  await selectElement.selectOption({ label });
  await frame.waitForTimeout(2000);

  logger?.debug('Statut selected', { label });
}

/**
 * Fill complete Section 4: Données de l'assuré principal
 * Fills: date_naissance, departement_residence, regime_social, profession, statut
 */
export async function fillSection4(
  frame: Frame,
  assurePrincipalData: AssurePrincipalData,
  logger?: FlowLogger
): Promise<void> {
  logger?.debug('Starting Section 4: Données de l\'assuré principal');

  await fillDateNaissanceAssurePrincipal(frame, assurePrincipalData.date_naissance, logger);
  await fillDepartementResidence(frame, assurePrincipalData.departement_residence, logger);
  await fillRegimeSocial(frame, assurePrincipalData.regime_social, logger);
  await fillProfession(frame, assurePrincipalData.profession, logger);
  await fillStatut(frame, assurePrincipalData.statut, assurePrincipalData.regime_social, logger);

  logger?.info('Section "Données de l\'assuré principal" completed', {
    section: 'assure_principal',
    fieldsCount: 5
  });
}
