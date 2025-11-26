import type { Frame } from '@playwright/test';
import type { FlowLogger } from '../../../../../../../../engine/FlowLogger';
import type { GammesOptionsData } from '../../../../transformers/types';
import { SWISSLIFE_STEP1_SELECTORS } from '../../selectors';
import { fillGamme } from './fill-gamme';
import { fillDateEffet } from './fill-date-effet';
import { fillLoiMadelin } from './fill-loi-madelin';
import { fillRepriseIsoGaranties } from './fill-reprise';
import { fillResiliationAEffectuer } from './fill-resiliation';
import { verifySection7 } from './verify';

// Re-export individual fillers for direct use if needed
export { fillGamme } from './fill-gamme';
export { fillDateEffet } from './fill-date-effet';
export { fillLoiMadelin } from './fill-loi-madelin';
export { fillRepriseIsoGaranties } from './fill-reprise';
export { fillResiliationAEffectuer } from './fill-resiliation';
export { verifySection7 } from './verify';

/**
 * Fill complete Section 7: Gammes et Options
 * Fills: gamme, date_effet, loi_madelin, reprise_iso_garanties, resiliation_a_effectuer
 * This is the final section of Step 1
 */
export async function fillSection7(
  frame: Frame,
  gammesOptions: GammesOptionsData,
  logger?: FlowLogger
): Promise<void> {
  logger?.debug('Starting Section 7: Gammes et Options');

  await fillGamme(frame, gammesOptions.gamme, logger);
  await fillDateEffet(frame, gammesOptions.date_effet, logger);

  // Loi Madelin checkbox only appears for TNS regimes
  // Check if the checkbox exists before trying to fill it
  const loiMadelinCheckbox = frame.getByRole('checkbox', { name: SWISSLIFE_STEP1_SELECTORS.section7.loi_madelin.byRole });
  const loiMadelinExists = await loiMadelinCheckbox.count() > 0;

  if (loiMadelinExists) {
    logger?.debug('Loi Madelin checkbox found, filling...');
    await fillLoiMadelin(frame, gammesOptions.loi_madelin, logger);
  } else {
    logger?.debug('Loi Madelin checkbox not present (non-TNS regime), skipping');
  }

  await fillRepriseIsoGaranties(frame, gammesOptions.reprise_iso_garanties, logger);
  await fillResiliationAEffectuer(frame, gammesOptions.resiliation_a_effectuer, logger);

  await verifySection7(frame, logger);

  logger?.info('Section "Gammes et Options" completed', { section: 'gammes_options', fieldsCount: 5 });
  logger?.info('STEP 1 COMPLETE - All sections filled!');
}
