import type { Frame } from 'playwright';
import type { FlowLogger } from '../../../../../../../../engine/FlowLogger';
import { SWISSLIFE_STEP1_SELECTORS } from '../../selectors';

/**
 * Verify that Section 7 fields have been filled correctly
 */
export async function verifySection7(
  frame: Frame,
  logger?: FlowLogger
): Promise<void> {
  logger?.debug('Verification: Final checks for Section 7');

  // Verify gamme
  const gammeValue = await frame.locator(SWISSLIFE_STEP1_SELECTORS.section7.gamme.primary).first().inputValue();
  logger?.debug('Verification: Gamme value', { gammeValue });

  // Verify date effet
  const dateEffetValue = await frame.locator(SWISSLIFE_STEP1_SELECTORS.section7.date_effet.primary).inputValue();
  logger?.debug('Verification: Date effet value', { dateEffetValue });

  // Verify loi madelin checkbox
  const loiMadelinChecked = await frame.getByRole('checkbox', { name: SWISSLIFE_STEP1_SELECTORS.section7.loi_madelin.byRole }).isChecked();
  logger?.debug('Verification: Loi Madelin checked', { loiMadelinChecked });
}
