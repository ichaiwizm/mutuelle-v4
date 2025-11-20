import type { Frame } from '@playwright/test';
import type { SwissLifeOneFormData } from '../../../transformers/types';
import { fillNomProjet } from '../field-fillers/fill-step1-section1';
import { fillSection2 as fillVosProjets } from '../field-fillers/fill-step1-section2';
import { fillSection3 as fillCouvertureSante } from '../field-fillers/fill-step1-section3';
import { fillSection4 as fillDonneesAssurePrincipal } from '../field-fillers/fill-step1-section4';

/**
 * Step 1 Form Filler
 * Handles all fields in Step 1: "Informations du projet et assurés"
 *
 * Current implementation: Sections 1, 2, 3, and 4 (partial)
 * - Section 1: Nom du projet
 * - Section 2: Vos projets (besoins)
 * - Section 3: Couverture santé individuelle (type_simulation)
 * - Section 4: Données de l'assuré principal (date_naissance only for now)
 */
export class Step1Fill {
  /**
   * Fill Step 1 - Section 1: Nom du projet
   */
  async fillSection1(frame: Frame, data: SwissLifeOneFormData): Promise<void> {
    await fillNomProjet(frame, data.projet.nom_projet);
  }

  /**
   * Fill Step 1 - Section 2: Vos projets (besoins)
   */
  async fillSection2(frame: Frame, data: SwissLifeOneFormData): Promise<void> {
    await fillVosProjets(
      frame,
      data.besoins.besoin_couverture_individuelle,
      data.besoins.besoin_indemnites_journalieres
    );
  }

  /**
   * Fill Step 1 - Section 3: Couverture santé individuelle (type_simulation)
   */
  async fillSection3(frame: Frame, data: SwissLifeOneFormData): Promise<void> {
    await fillCouvertureSante(frame, data.type_simulation);
  }

  /**
   * Fill Step 1 - Section 4: Données de l'assuré principal (partial)
   * Currently only fills date_naissance
   */
  async fillSection4(frame: Frame, data: SwissLifeOneFormData): Promise<void> {
    await fillDonneesAssurePrincipal(frame, data.assure_principal);
  }

  /**
   * Fill complete Step 1
   * Currently fills Sections 1, 2, 3, and 4 (partial)
   */
  async fill(frame: Frame, data: SwissLifeOneFormData): Promise<void> {
    console.log('\n═══════════════════════════════════════');
    console.log('   STEP 1: Informations du projet');
    console.log('═══════════════════════════════════════\n');

    await this.fillSection1(frame, data);
    await this.fillSection2(frame, data);
    await this.fillSection3(frame, data);
    await this.fillSection4(frame, data);

    console.log('✅ Step 1 complété\n');
  }
}
