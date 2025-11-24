import type { Page } from 'playwright';
import type { AlptisFormData } from '../../../transformers/types';
import type { FlowLogger } from '../../../../../../engine/FlowLogger';
import {
  fillToggleEnfants,
  fillEnfantDateNaissance,
  fillEnfantRegimeObligatoire,
  clickAjouterEnfant,
} from '../fill-section4';
import { AlptisTimeouts } from '../../../../../../../config';

/**
 * Section 4: Enfant(s)
 * Handles toggle + 2 fields per child: date_naissance, regime_obligatoire
 */
export class Section4Fill {
  /**
   * Fill Section 4: Enfant(s) - Toggle only
   */
  async fillToggle(page: Page, hasEnfants: boolean, logger?: FlowLogger): Promise<void> {
    logger?.debug('Starting Section 4: Enfant(s) - Toggle', { hasEnfants });
    await fillToggleEnfants(page, hasEnfants, logger);
    logger?.info('Section "Enfant(s)" toggle completed', {
      section: 'enfants_toggle',
      hasEnfants,
    });
  }

  /**
   * Fill Section 4: Enfant(s) - All children
   * Note: Should be called AFTER fillToggle when hasEnfants is true
   */
  async fill(page: Page, enfants: AlptisFormData['enfants'], logger?: FlowLogger): Promise<void> {
    if (!enfants || enfants.length === 0) {
      logger?.debug('No enfants data, skipping form fill');
      return;
    }

    logger?.debug('Starting Section 4: Enfant(s) - Form', { enfantsCount: enfants.length });

    // Wait for form fields to appear after toggle
    await page.waitForTimeout(AlptisTimeouts.formFieldsAppear);

    // Fill all children
    for (let i = 0; i < enfants.length; i++) {
      const enfant = enfants[i];

      // For second child and beyond, click "Ajouter un enfant" button first
      if (i > 0) {
        logger?.debug(`Adding child ${i + 1}/${enfants.length}`);
        await clickAjouterEnfant(page, i + 1, logger);
      }

      // Fill child's data (date + regime)
      await fillEnfantDateNaissance(page, enfant.date_naissance, i, logger);
      await fillEnfantRegimeObligatoire(page, enfant.regime_obligatoire, i, logger);

      logger?.debug(`Child ${i + 1}/${enfants.length} filled`, { childIndex: i });
    }

    const totalFields = enfants.length * 2;
    logger?.info('Section "Enfant(s)" form completed', {
      section: 'enfants_form',
      enfantsCount: enfants.length,
      totalFields,
    });
  }
}
