import type { Page } from 'playwright';
import type { AlptisFormData } from '../../../transformers/types';
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
  async fillToggle(page: Page, hasConjoint: boolean): Promise<void> {
    console.log('--- SECTION: Conjoint(e) ---');

    await scrollToSection(page, 'Conjoint');
    await fillToggleConjoint(page, hasConjoint);

    console.log(`✅ Section "Conjoint(e)" toggle complétée (1/5 champs)`);
    console.log('---');
  }

  /**
   * Fill Section 3: Conjoint(e) - Complete form
   * Note: Should be called AFTER fillToggle when hasConjoint is true
   */
  async fill(page: Page, data: AlptisFormData['conjoint']): Promise<void> {
    if (!data) {
      console.log('⏭️ Pas de données conjoint, remplissage ignoré');
      return;
    }

    console.log('--- SECTION: Conjoint(e) - Formulaire ---');

    // Wait for form fields to appear after toggle
    await page.waitForTimeout(AlptisTimeouts.formFieldsAppear);

    await fillConjointDateNaissance(page, data.date_naissance);
    await fillConjointCategorieSocioprofessionnelle(page, data.categorie_socioprofessionnelle);

    // Cadre d'exercice is conditional - only appears for certain professions
    if (data.cadre_exercice) {
      await fillConjointCadreExercice(page, data.cadre_exercice);
    }

    await fillConjointRegimeObligatoire(page, data.regime_obligatoire);

    const fieldCount = data.cadre_exercice ? '4/4' : '3/3';
    console.log(`✅ Section "Conjoint(e)" formulaire complété (${fieldCount} champs)`);
    console.log('---');
  }
}
