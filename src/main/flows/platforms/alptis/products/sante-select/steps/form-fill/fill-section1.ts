import type { Page } from 'playwright';
import type { FlowLogger } from '../../../../../../engine/FlowLogger';
import { SECTION_1_SELECTORS } from './selectors';
import { verifyToggleState, verifyRadioSelection } from './verifiers';
import { fillDateField } from './operations';
import { AlptisTimeouts } from '../../../../../../config';

/**
 * Section 1 - Remplacement d'un contrat
 */
export async function fillRemplacementContrat(page: Page, shouldCheck: boolean, logger?: FlowLogger): Promise<void> {
  logger?.debug('Filling remplacement contrat', { shouldCheck, field: '1/3' });

  const toggleLocator = page.locator(SECTION_1_SELECTORS.remplacement_contrat.primary).first();
  const isCurrentlyChecked = await toggleLocator.isChecked();

  if (isCurrentlyChecked !== shouldCheck) {
    await toggleLocator.click();
    logger?.debug('Toggle clicked', { wasChecked: isCurrentlyChecked, nowChecked: shouldCheck });
    await page.waitForTimeout(AlptisTimeouts.toggle);
  } else {
    logger?.debug('Toggle already in correct state');
  }

  await verifyToggleState(page, toggleLocator, shouldCheck);
}

/**
 * Section 1 - Demande de résiliation (conditionnel)
 */
export async function fillDemandeResiliation(page: Page, value: 'Oui' | 'Non', logger?: FlowLogger): Promise<void> {
  logger?.debug('Filling demande résiliation (conditional)', { value, field: '2/3' });

  const radioSelector = SECTION_1_SELECTORS.demande_resiliation.primary;
  await page.waitForSelector(radioSelector, { state: 'visible', timeout: AlptisTimeouts.elementVisible });
  logger?.debug('Conditional field visible');

  const radioLocator = page.locator(SECTION_1_SELECTORS.demande_resiliation.byValue(value));
  await radioLocator.click();
  logger?.debug('Radio option selected', { value });

  await verifyRadioSelection(page, radioLocator, value);
}

/**
 * Section 1 - Date d'effet
 */
export async function fillDateEffet(page: Page, dateEffet: string, logger?: FlowLogger): Promise<void> {
  await fillDateField(page, dateEffet, 0, '[3/3] Date d\'effet', logger);
}


