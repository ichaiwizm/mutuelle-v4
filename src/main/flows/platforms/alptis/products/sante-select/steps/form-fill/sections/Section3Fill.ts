import type { Page } from 'playwright';
import type { AlptisFormData } from '../../../transformers/types';
import type { FlowLogger } from '../../../../../../../engine/FlowLogger';
import { scrollToSection } from '../helpers/scroll-helpers';
import {
  fillToggleConjoint,
  fillConjointDateNaissance,
  fillConjointCategorieSocioprofessionnelle,
  fillConjointCadreExercice,
  fillConjointRegimeObligatoire,
} from '../fill-section3';
import { AlptisTimeouts } from '../../../../../../../config';

/**
 * Section 3: Conjoint(e)
 * Handles toggle + 4 form fields: date_naissance, categorie_socioprofessionnelle,
 * cadre_exercice (conditional), regime_obligatoire
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
   */
  async fill(page: Page, data: AlptisFormData['conjoint'], logger?: FlowLogger): Promise<void> {
    if (!data) {
      logger?.debug('No conjoint data, skipping form fill');
      return;
    }

    logger?.debug('Starting Section 3: Conjoint(e) - Form');

    // Wait for form fields to appear after toggle
    await page.waitForTimeout(AlptisTimeouts.formFieldsAppear);

    await fillConjointDateNaissance(page, data.date_naissance, logger);
    await fillConjointCategorieSocioprofessionnelle(page, data.categorie_socioprofessionnelle, logger);

    // Cadre d'exercice is conditional - only appears for certain professions
    if (data.cadre_exercice) {
      await fillConjointCadreExercice(page, data.cadre_exercice, logger);
    }

    await fillConjointRegimeObligatoire(page, data.regime_obligatoire, logger);

    const fieldCount = data.cadre_exercice ? 4 : 3;
    logger?.info('Section "Conjoint(e)" form completed', {
      section: 'conjoint_form',
      fieldsCount: fieldCount,
      hasCadreExercice: !!data.cadre_exercice,
    });
  }
}
