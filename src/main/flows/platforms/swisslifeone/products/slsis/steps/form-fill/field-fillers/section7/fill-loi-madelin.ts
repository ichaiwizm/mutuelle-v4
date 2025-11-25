import type { Frame } from '@playwright/test';
import type { FlowLogger } from '../../../../../../../engine/FlowLogger';
import { SWISSLIFE_STEP1_SELECTORS } from '../../selectors';
import { SwissLifeOneTimeouts } from '../../../../../../../../config';

/**
 * Fill "Loi Madelin" checkbox (Step 1, Section 7)
 * Only applicable for TNS regime
 */
export async function fillLoiMadelin(
  frame: Frame,
  loiMadelin: boolean,
  logger?: FlowLogger
): Promise<void> {
  logger?.debug('Filling Loi Madelin', {
    loiMadelin: loiMadelin ? 'checked' : 'unchecked',
    field: '3/5',
    checkboxName: SWISSLIFE_STEP1_SELECTORS.section7.loi_madelin.byRole
  });

  const checkbox = frame.getByRole('checkbox', { name: SWISSLIFE_STEP1_SELECTORS.section7.loi_madelin.byRole });
  await checkbox.waitFor({ state: 'visible', timeout: 10000 });

  const currentState = await checkbox.isChecked();
  logger?.debug('Checkbox found and visible', { currentState, targetState: loiMadelin });

  // Use JavaScript to set checkbox state directly (bypasses viewport issues)
  await checkbox.evaluate((el: HTMLInputElement, value: boolean) => {
    el.checked = value;
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('click', { bubbles: true }));
  }, loiMadelin);

  // Verify checkbox state after setting
  const isCheckedAfter = await checkbox.isChecked();
  logger?.debug('Checkbox state updated', { isCheckedAfter });

  await frame.waitForTimeout(SwissLifeOneTimeouts.afterClick);
  logger?.debug('Loi Madelin filled', { loiMadelin });
}
