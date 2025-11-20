import type { Frame } from '@playwright/test';
import type { SwissLifeOneFormData } from '../../../transformers/types';
import { fillNomProjet } from '../field-fillers/fill-step1-section1';

/**
 * Step 1 Form Filler
 * Handles all fields in Step 1: "Informations du projet et assurés"
 *
 * Current implementation: Section 1 only (Nom du projet)
 * Future sections:
 * - Section 2: Vos projets (besoins)
 * - Section 3: Couverture santé individuelle (type_simulation, assurés)
 */
export class Step1Fill {
  /**
   * Fill Step 1 - Section 1: Nom du projet
   */
  async fillSection1(frame: Frame, data: SwissLifeOneFormData): Promise<void> {
    await fillNomProjet(frame, data.projet.nom_projet);
  }

  /**
   * Fill complete Step 1
   * Currently only fills Section 1 (nom du projet)
   */
  async fill(frame: Frame, data: SwissLifeOneFormData): Promise<void> {
    console.log('\n═══════════════════════════════════════');
    console.log('   STEP 1: Informations du projet');
    console.log('═══════════════════════════════════════\n');

    await this.fillSection1(frame, data);

    console.log('✅ Step 1 complété\n');
  }
}
