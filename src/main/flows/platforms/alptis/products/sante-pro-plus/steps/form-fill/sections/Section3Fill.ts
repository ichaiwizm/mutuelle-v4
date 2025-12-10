import type { Page } from 'playwright';
import type { SanteProPlusFormData } from '../../../transformers/types';
import type { FlowLogger } from '../../../../../../../engine/FlowLogger';
import { scrollToSection } from '../helpers/scroll-helpers';
import {
  fillToggleConjoint,
  fillConjointDateNaissance,
  fillConjointCategorieSocioprofessionnelle,
  fillConjointRegimeObligatoire,
} from '../fill-section3';
import { AlptisTimeouts } from '../../../../../../../config';

/**
 * Section 3: Conjoint(e)
 * Simplifié pour Santé Pro Plus:
 * - toggle + 3 form fields: date_naissance, categorie_socioprofessionnelle, regime_obligatoire
 * - PAS de cadre_exercice (contrairement à Santé Select)
 */
export class Section3Fill {
  /**
   * Fill Section 3: Conjoint(e) - Toggle only
   */
  async fillToggle(page: Page, hasConjoint: boolean, logger?: FlowLogger): Promise<void> {
    logger?.debug('Starting Section 3: Conjoint(e) - Toggle', { hasConjoint });

    await scrollToSection(page, 'Conjoint', logger);
    await fillToggleConjoint(page, hasConjoint, logger);

    logger?.info('Section "Conjoint(e)" toggle completed', {
      section: 'conjoint_toggle',
      hasConjoint,
    });
  }

  /**
   * Fill Section 3: Conjoint(e) - Complete form
   * Note: Should be called AFTER fillToggle when hasConjoint is true
   * Note: PAS de cadre_exercice pour le conjoint dans Santé Pro Plus
   */
  async fill(page: Page, data: SanteProPlusFormData['conjoint'], logger?: FlowLogger): Promise<void> {
    if (!data) {
      logger?.debug('No conjoint data, skipping form fill');
      return;
    }

    logger?.debug('Starting Section 3: Conjoint(e) - Form (simplified for Santé Pro Plus)');

    // Wait for form fields to appear after toggle
    await page.waitForTimeout(AlptisTimeouts.formFieldsAppear);

    await fillConjointDateNaissance(page, data.date_naissance, logger);
    await fillConjointCategorieSocioprofessionnelle(page, data.categorie_socioprofessionnelle, logger);
    await fillConjointRegimeObligatoire(page, data.regime_obligatoire, logger);

    // PAS de cadre_exercice pour le conjoint dans Santé Pro Plus

    logger?.info('Section "Conjoint(e)" form completed', {
      section: 'conjoint_form',
      fieldsCount: 3,
      note: 'No cadre_exercice in Santé Pro Plus',
    });
  }
}
