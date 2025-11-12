import type { Lead } from '../../types.js';
import { PremiumFormData, EnrichmentResult } from './types.js';

/**
 * Enrichisseur de données qui génère les champs manquants
 * Ajoute les données spécifiques au produit Premium non présentes dans les Leads
 */
export class DataEnricher {
  /**
   * Enrichit les données du formulaire avec les champs manquants
   */
  static enrich(
    lead: Lead,
    baseFormData: PremiumFormData
  ): EnrichmentResult<PremiumFormData> {
    const enriched = { ...baseFormData };
    const addedFields: string[] = [];

    // Numéro de sécurité sociale (généré si manquant)
    if (!enriched.numeroSecuriteSociale) {
      enriched.numeroSecuriteSociale = this.generateSecuNumber(
        enriched.dateNaissance,
        enriched.civilite
      );
      addedFields.push('numeroSecuriteSociale (généré)');
    }

    // Mutuelle actuelle
    if (!enriched.mutuelleActuelle) {
      enriched.mutuelleActuelle = enriched.actuellementAssure
        ? 'Non précisée'
        : 'Aucune';
      addedFields.push('mutuelleActuelle');
    }

    // Antécédents médicaux (défaut: Non)
    if (enriched.antecedentsMedicaux === undefined) {
      enriched.antecedentsMedicaux = false;
      addedFields.push('antecedentsMedicaux (défaut: false)');
    }

    // Régime fiscal (conditionnel à profession)
    if (this.needsRegimeFiscal(enriched.profession) && !enriched.regimeFiscal) {
      enriched.regimeFiscal = 'Micro-entreprise';
      addedFields.push('regimeFiscal (profession TNS/Indépendant)');
    }

    return { enriched, addedFields };
  }

  /**
   * Génère un numéro de sécurité sociale fictif mais valide
   * Format: 1 (sexe) + YY (année) + MM (mois) + DD (dept) + NNN (commune) + NNN (ordre) + CC (clé)
   */
  private static generateSecuNumber(
    dateNaissance: string,
    civilite: string
  ): string {
    const [year, month] = dateNaissance.split('-');
    const sexe = civilite === 'M.' ? '1' : '2';
    const yy = year.slice(2);
    const mm = month;
    const dept = '75'; // Paris par défaut
    const commune = '001';
    const ordre = this.randomDigits(3);
    const cle = this.calculateSecuKey(sexe + yy + mm + dept + commune + ordre);

    return sexe + yy + mm + dept + commune + ordre + cle;
  }

  /**
   * Génère des chiffres aléatoires
   */
  private static randomDigits(length: number): string {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
  }

  /**
   * Calcule la clé du numéro de sécurité sociale
   * Algorithme simplifié (97 - (numéro % 97))
   */
  private static calculateSecuKey(number: string): string {
    const num = parseInt(number);
    const key = 97 - (num % 97);
    return String(key).padStart(2, '0');
  }

  /**
   * Détermine si un régime fiscal est nécessaire basé sur la profession
   */
  private static needsRegimeFiscal(profession: string): boolean {
    const tnsKeywords = [
      'independant',
      'indépendant',
      'tns',
      'auto-entrepreneur',
      'micro',
      'chef d\'entreprise'
    ];

    const lowerProfession = profession.toLowerCase();
    return tnsKeywords.some(kw => lowerProfession.includes(kw));
  }

  /**
   * Génère des valeurs par défaut pour tous les champs Premium manquants
   */
  static generateDefaults(): Partial<PremiumFormData> {
    return {
      numeroSecuriteSociale: '1' + '99' + '01' + '75' + '001' + '123' + '45',
      mutuelleActuelle: 'Aucune',
      antecedentsMedicaux: false,
      regimeFiscal: 'Non concerné'
    };
  }

  /**
   * Vérifie si les données sont complètes (tous les champs requis présents)
   */
  static isComplete(formData: PremiumFormData): {
    complete: boolean;
    missingFields: string[];
  } {
    const requiredFields: Array<keyof PremiumFormData> = [
      'civilite',
      'nom',
      'prenom',
      'dateNaissance',
      'email',
      'telephone',
      'adresse',
      'codePostal',
      'ville',
      'profession',
      'regimeSocial',
      'dateEffet',
      'numeroSecuriteSociale',
      'mutuelleActuelle'
    ];

    const missingFields: string[] = [];

    for (const field of requiredFields) {
      const value = formData[field];
      if (value === undefined || value === null || value === '') {
        missingFields.push(String(field));
      }
    }

    return {
      complete: missingFields.length === 0,
      missingFields
    };
  }
}
