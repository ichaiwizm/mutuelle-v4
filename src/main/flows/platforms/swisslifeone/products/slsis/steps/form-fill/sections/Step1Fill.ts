import type { Frame } from 'playwright';
import type { FlowLogger } from '../../../../../../../engine/FlowLogger';
import type { SwissLifeOneFormData } from '../../../transformers/types';
import { fillNomProjet } from '../field-fillers/fill-step1-section1';
import { fillSection2 as fillVosProjets } from '../field-fillers/fill-step1-section2';
import { fillSection3 as fillCouvertureSante } from '../field-fillers/fill-step1-section3';
import { fillSection4 as fillDonneesAssurePrincipal } from '../field-fillers/fill-step1-section4';
import { fillSection5 as fillDonneesConjoint } from '../field-fillers/fill-step1-section5';
import { fillSection6 as fillEnfants } from '../field-fillers/fill-step1-section6';
import { fillSection7 as fillGammesOptions } from '../field-fillers/fill-step1-section7';

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
  private logger?: FlowLogger;
  /**
   * Fill Step 1 - Section 1: Nom du projet
   */
  async fillSection1(frame: Frame, data: SwissLifeOneFormData, logger?: FlowLogger): Promise<void> {
    this.logger = logger;
    await fillNomProjet(frame, data.projet.nom_projet, this.logger);
  }

  /**
   * Fill Step 1 - Section 2: Vos projets (besoins)
   */
  async fillSection2(frame: Frame, data: SwissLifeOneFormData, logger?: FlowLogger): Promise<void> {
    this.logger = logger;
    await fillVosProjets(
      frame,
      data.besoins.besoin_couverture_individuelle,
      data.besoins.besoin_indemnites_journalieres,
      this.logger
    );
  }

  /**
   * Fill Step 1 - Section 3: Couverture santé individuelle (type_simulation)
   */
  async fillSection3(frame: Frame, data: SwissLifeOneFormData, logger?: FlowLogger): Promise<void> {
    this.logger = logger;
    await fillCouvertureSante(frame, data.type_simulation, this.logger);
  }

  /**
   * Fill Step 1 - Section 4: Données de l'assuré principal
   */
  async fillSection4(frame: Frame, data: SwissLifeOneFormData, logger?: FlowLogger): Promise<void> {
    this.logger = logger;
    await fillDonneesAssurePrincipal(frame, data.assure_principal, this.logger);
  }

  /**
   * Fill Step 1 - Section 5: Données du conjoint (optional)
   * Only called if conjoint data is present
   */
  async fillSection5(frame: Frame, data: SwissLifeOneFormData, logger?: FlowLogger): Promise<void> {
    this.logger = logger;
    if (!data.conjoint) {
      this.logger?.debug('No conjoint data, Section 5 skipped');
      return;
    }
    await fillDonneesConjoint(frame, data.conjoint, this.logger);
  }

  /**
   * Fill Step 1 - Section 6: Enfants (optional)
   * Always called but skips if no children data
   */
  async fillSection6(frame: Frame, data: SwissLifeOneFormData, logger?: FlowLogger): Promise<void> {
    this.logger = logger;
    await fillEnfants(frame, data.enfants, this.logger);
  }

  /**
   * Fill Step 1 - Section 7: Gammes et Options (final section)
   * Always called - contains gamme, date_effet, loi_madelin, reprise_iso_garanties, resiliation
   */
  async fillSection7(frame: Frame, data: SwissLifeOneFormData, logger?: FlowLogger): Promise<void> {
    this.logger = logger;
    await fillGammesOptions(frame, data.gammes_options, this.logger);
  }

  /**
   * Fill complete Step 1
   * Fills all 7 sections: Projet, Besoins, Type simulation, Assuré principal, Conjoint, Enfants, Gammes
   */
  async fill(frame: Frame, data: SwissLifeOneFormData, logger?: FlowLogger): Promise<void> {
    this.logger = logger;

    this.logger?.info('Starting STEP 1: Informations du projet');

    await this.fillSection1(frame, data, this.logger);
    await this.fillSection2(frame, data, this.logger);
    await this.fillSection3(frame, data, this.logger);
    await this.fillSection4(frame, data, this.logger);
    await this.fillSection5(frame, data, this.logger);
    await this.fillSection6(frame, data, this.logger);
    await this.fillSection7(frame, data, this.logger);

    this.logger?.info('Step 1 completed - All 7 sections filled');
  }
}
