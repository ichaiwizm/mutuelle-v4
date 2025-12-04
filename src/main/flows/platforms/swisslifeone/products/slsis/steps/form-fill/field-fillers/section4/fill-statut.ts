import type { Frame } from 'playwright';
import type { FlowLogger } from '../../../../../../../../engine/FlowLogger';
import { SWISSLIFE_STEP1_SELECTORS } from '../../selectors';
import { mapStatutToFormLabel } from '../../mappers/statut-form-mapper';
import type { AssurePrincipalData } from '../../../../transformers/types';

/**
 * Fill "Statut" field for assure principal (Step 1, Section 4)
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
