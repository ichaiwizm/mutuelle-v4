import type { Page } from 'playwright';
import type { AlptisFormData } from '../../../transformers/types';
import {
  fillToggleEnfants,
  fillEnfantDateNaissance,
  fillEnfantRegimeObligatoire,
  clickAjouterEnfant,
} from '../fill-section4';

/**
 * Section 4: Enfant(s)
 * Handles toggle + 2 fields per child: date_naissance, regime_obligatoire
 */
export class Section4Fill {
  /**
   * Fill Section 4: Enfant(s) - Toggle only
   */
  async fillToggle(page: Page, hasEnfants: boolean): Promise<void> {
    console.log('--- SECTION: Enfant(s) ---');
    await fillToggleEnfants(page, hasEnfants);
    console.log(`✅ Section "Enfant(s)" toggle complétée (1/N champs)`);
    console.log('---');
  }

  /**
   * Fill Section 4: Enfant(s) - All children
   * Note: Should be called AFTER fillToggle when hasEnfants is true
   */
  async fill(page: Page, enfants: AlptisFormData['enfants']): Promise<void> {
    if (!enfants || enfants.length === 0) {
      console.log('⏭️ Pas de données enfants, remplissage ignoré');
      return;
    }

    console.log('--- SECTION: Enfant(s) - Formulaire ---');

    // Wait for form fields to appear after toggle
    await page.waitForTimeout(500);

    // Fill all children
    for (let i = 0; i < enfants.length; i++) {
      const enfant = enfants[i];

      // For second child and beyond, click "Ajouter un enfant" button first
      if (i > 0) {
        console.log(`➕ Ajout enfant ${i + 1}/${enfants.length}`);
        await clickAjouterEnfant(page, i + 1);
      }

      // Fill child's data (date + regime)
      await fillEnfantDateNaissance(page, enfant.date_naissance, i);
      await fillEnfantRegimeObligatoire(page, enfant.regime_obligatoire, i);

      console.log(`✅ Enfant ${i + 1}/${enfants.length} rempli (2/2 champs)`);
    }

    const totalFields = enfants.length * 2;
    console.log(`✅ Section "Enfant(s)" formulaire complété (${totalFields}/${totalFields} champs pour ${enfants.length} enfant(s))`);
    console.log('---');
  }
}
