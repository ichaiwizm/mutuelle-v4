import type { Lead } from '../../types.js';
import { BaseTransformer } from '../../core/BaseTransformer.js';
import { PremiumFormData } from './types.js';
import { ProfessionMapper } from './professionMapper.js';
import { ValidationAdapter } from './validationAdapter.js';
import { DataEnricher } from './dataEnricher.js';
import { debug, debugWarn } from '../../utils/debug.js';

/**
 * Transformer Premium avec adaptations intelligentes
 * Utilise ProfessionMapper, ValidationAdapter et DataEnricher
 */
export class PremiumTransformer extends BaseTransformer<PremiumFormData> {
  private professionMapper = ProfessionMapper;
  private validationAdapter = new ValidationAdapter();
  private dataEnricher = DataEnricher;

  /**
   * Transforme un Lead en PremiumFormData avec toutes les adaptations
   */
  transform(lead: Lead): PremiumFormData {
    const subscriber = lead.subscriber;
    const project = lead.project;
    const children = lead.children;

    // 1. Transformation de base
    const baseFormData: PremiumFormData = {
      // Personal information
      civilite: this.extractString(subscriber, 'civilite'),
      nom: this.extractString(subscriber, 'nom'),
      prenom: this.extractString(subscriber, 'prenom'),
      dateNaissance: this.convertDateToHtmlFormat(
        this.extractString(subscriber, 'dateNaissance')
      ),
      email: this.extractString(subscriber, 'email'),
      telephone: this.formatPhone(this.extractString(subscriber, 'telephone')),

      // Address
      adresse: this.extractString(subscriber, 'adresse'),
      codePostal: this.extractString(subscriber, 'codePostal'),
      ville: this.extractString(subscriber, 'ville'),

      // Professional - avec mapping intelligent
      profession: this.mapProfession(this.extractString(subscriber, 'profession')),
      regimeSocial: this.extractString(subscriber, 'regimeSocial'),

      // Family
      nombreEnfants: this.extractNumber(subscriber, 'nombreEnfants', children?.length || 0),
      hasConjoint: this.extractBoolean(subscriber, 'hasConjoint'),

      // Project/Coverage - avec defaults
      dateEffet: project
        ? this.convertDateToHtmlFormat(this.extractString(project, 'dateEffet'))
        : this.getDefaultDateEffet(14),
      actuellementAssure: this.extractBoolean(project, 'actuellementAssure'),
      soinsMedicaux: this.extractNumber(project, 'soinsMedicaux', 2),
      hospitalisation: this.extractNumber(project, 'hospitalisation', 2),
      optique: this.extractNumber(project, 'optique', 2),
      dentaire: this.extractNumber(project, 'dentaire', 2),

      // Champs Premium (seront enrichis)
      numeroSecuriteSociale: '',
      mutuelleActuelle: '',
      antecedentsMedicaux: false,
    };

    // Ajouter les données du conjoint si présent
    if (baseFormData.hasConjoint && subscriber) {
      baseFormData.conjoint_dateNaissance = this.convertDateToHtmlFormat(
        this.extractString(subscriber, 'conjoint_dateNaissance')
      );
      baseFormData.conjoint_profession = this.mapProfession(
        this.extractString(subscriber, 'conjoint_profession')
      );
      baseFormData.conjoint_regimeSocial = this.extractString(subscriber, 'conjoint_regimeSocial');
    }

    // Ajouter les enfants
    if (children && children.length > 0) {
      baseFormData.children = children.map((child, index) => ({
        dateNaissance: this.convertDateToHtmlFormat(
          this.extractString(child, 'dateNaissance')
        ),
        order: index + 1
      }));
    }

    // 2. Validation et adaptation
    const { adapted, warnings } = this.validationAdapter.adapt(baseFormData);

    if (warnings.length > 0) {
      debug('[PremiumTransformer] Adaptations appliquées:', warnings);
    }

    // 3. Enrichissement des données manquantes
    const { enriched, addedFields } = this.dataEnricher.enrich(lead, adapted);

    if (addedFields.length > 0) {
      debug('[PremiumTransformer] Champs ajoutés:', addedFields);
    }

    return enriched;
  }

  /**
   * Mappe une profession avec le ProfessionMapper
   */
  private mapProfession(leadProfession: string): string {
    const mapping = this.professionMapper.map(leadProfession);

    if (mapping.confidence === 'fallback') {
      debugWarn(
        `[PremiumTransformer] Profession "${leadProfession}" non trouvée, fallback vers "${mapping.formValue}"`
      );
    }

    return mapping.formValue;
  }
}
