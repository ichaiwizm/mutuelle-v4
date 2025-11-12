import { ProfessionMapping } from './types.js';

/**
 * Mapper intelligent pour les professions
 * Gère les professions manquantes dans le select avec mappings intelligents
 */
export class ProfessionMapper {
  /**
   * Mappings des professions des Leads vers les options disponibles dans le select Premium
   */
  private static readonly MAPPINGS: Record<string, string> = {
    // Mappings exacts (professions qui existent telles quelles)
    'Salarié': 'Salarie',
    'Salarie': 'Salarie',
    'Retraité': 'Retraite',
    'Retraite': 'Retraite',
    'Artisan': 'Artisan',
    'Étudiant': 'Etudiant',
    'Etudiant': 'Etudiant',

    // Professions libérales → Consultant
    'Profession libérale': 'Consultant',
    'Profession liberale': 'Consultant',
    'Libéral': 'Consultant',
    'Liberal': 'Consultant',
    'Freelance': 'Consultant',
    'Consultant': 'Consultant',
    'Médecin': 'Consultant',
    'Medecin': 'Consultant',
    'Avocat': 'Consultant',
    'Architecte': 'Consultant',
    'Expert-comptable': 'Consultant',

    // TNS / Indépendants
    'TNS : régime des indépendants': 'Independant',
    'TNS : regime des independants': 'Independant',
    'TNS': 'Independant',
    'Indépendant': 'Independant',
    'Independant': 'Independant',
    'Chef d\'entreprise': 'Independant',
    'Auto-entrepreneur': 'Independant',
    'Micro-entrepreneur': 'Independant',
    'Commerçant': 'Independant',
    'Commercant': 'Independant',

    // Professions spécifiques → Catégories générales
    'Infirmier': 'Salarie',
    'Infirmiere': 'Salarie',
    'Professeur': 'Salarie',
    'Enseignant': 'Salarie',
    'Ingénieur': 'Salarie',
    'Ingenieur': 'Salarie',
    'Technicien': 'Salarie',
    'Employé': 'Salarie',
    'Employe': 'Salarie',
    'Ouvrier': 'Salarie',
    'Cadre': 'Salarie',

    // Sans emploi
    'Sans emploi': 'En recherche d\'emploi',
    'Chômeur': 'En recherche d\'emploi',
    'Chomeur': 'En recherche d\'emploi',
    'Demandeur d\'emploi': 'En recherche d\'emploi',

    // Fallbacks
    'Non renseigné': 'Autre',
    'Non renseigne': 'Autre',
    'Autre': 'Autre',
    '': 'Autre',
  };

  /**
   * Mappings exacts - professions communes qui doivent être traitées comme des correspondances exactes
   * Ces mappings normalisent les accents mais sont considérés comme "exact" match
   */
  private static readonly EXACT_MAPPINGS: Record<string, string> = {
    'Salarié': 'Salarie',
    'Salarie': 'Salarie',
    'Retraité': 'Retraite',
    'Retraite': 'Retraite',
    'Artisan': 'Artisan',
    'Étudiant': 'Etudiant',
    'Etudiant': 'Etudiant',
    'Consultant': 'Consultant',
    'Independant': 'Independant',
    'Indépendant': 'Independant',
  };

  /**
   * Options disponibles dans le select Premium (liste limitée)
   */
  private static readonly AVAILABLE_OPTIONS = [
    'Consultant',
    'Independant',
    'Artisan',
    'Salarie',
    'En recherche d\'emploi',
    'Retraite',
    'Etudiant',
    'Fonctionnaire',
    'Agriculteur',
    'Autre'
  ];

  /**
   * Mappe une profession de Lead vers une option du select Premium
   * @param leadProfession Profession extraite du Lead
   * @returns ProfessionMapping avec la valeur mappée et le niveau de confiance
   */
  static map(leadProfession: string): ProfessionMapping {
    // Nettoyage
    const cleaned = leadProfession.trim();

    // 1. Recherche dans les mappings exacts (professions communes)
    const exactMapped = this.EXACT_MAPPINGS[cleaned];
    if (exactMapped && this.AVAILABLE_OPTIONS.includes(exactMapped)) {
      return {
        leadValue: leadProfession,
        formValue: exactMapped,
        confidence: 'exact'
      };
    }

    // 2. Recherche dans les mappings prédéfinis (profession libérale, TNS, etc.)
    const mapped = this.MAPPINGS[cleaned];
    if (mapped && this.AVAILABLE_OPTIONS.includes(mapped)) {
      return {
        leadValue: leadProfession,
        formValue: mapped,
        confidence: 'mapped'
      };
    }

    // 3. Recherche fuzzy (similitude/mots-clés)
    const fuzzyMatch = this.fuzzyMatch(cleaned);
    if (fuzzyMatch) {
      return {
        leadValue: leadProfession,
        formValue: fuzzyMatch,
        confidence: 'mapped'
      };
    }

    // 4. Fallback
    return {
      leadValue: leadProfession,
      formValue: 'Autre',
      confidence: 'fallback'
    };
  }

  /**
   * Matching fuzzy basé sur des mots-clés
   */
  private static fuzzyMatch(input: string): string | null {
    const lowerInput = input.toLowerCase();

    // Mots-clés pour consultant/libéral
    if (lowerInput.includes('liberal') ||
        lowerInput.includes('libéral') ||
        lowerInput.includes('consultant') ||
        lowerInput.includes('freelance')) {
      return 'Consultant';
    }

    // Mots-clés pour indépendant/TNS
    if (lowerInput.includes('independant') ||
        lowerInput.includes('indépendant') ||
        lowerInput.includes('tns') ||
        lowerInput.includes('auto-entrepreneur') ||
        lowerInput.includes('micro')) {
      return 'Independant';
    }

    // Mots-clés pour artisan
    if (lowerInput.includes('artisan')) {
      return 'Artisan';
    }

    // Mots-clés pour salarié
    if (lowerInput.includes('salari') ||
        lowerInput.includes('employ') ||
        lowerInput.includes('cadre') ||
        lowerInput.includes('technicien') ||
        lowerInput.includes('ouvrier')) {
      return 'Salarie';
    }

    // Mots-clés pour retraité
    if (lowerInput.includes('retraite') ||
        lowerInput.includes('retraité') ||
        lowerInput.includes('pension')) {
      return 'Retraite';
    }

    // Mots-clés pour sans emploi
    if (lowerInput.includes('chomage') ||
        lowerInput.includes('chômage') ||
        lowerInput.includes('recherche') ||
        lowerInput.includes('sans emploi')) {
      return 'En recherche d\'emploi';
    }

    // Mots-clés pour agriculteur
    if (lowerInput.includes('agricul') ||
        lowerInput.includes('fermier') ||
        lowerInput.includes('eleveur') ||
        lowerInput.includes('éleveur')) {
      return 'Agriculteur';
    }

    // Mots-clés pour fonctionnaire
    if (lowerInput.includes('fonctionnaire') ||
        lowerInput.includes('fonction publique') ||
        lowerInput.includes('public')) {
      return 'Fonctionnaire';
    }

    return null;
  }

  /**
   * Retourne la liste des options disponibles
   */
  static getAvailableOptions(): string[] {
    return [...this.AVAILABLE_OPTIONS];
  }

  /**
   * Valide qu'un mapping est correct
   */
  static validateMapping(mapping: ProfessionMapping): boolean {
    return this.AVAILABLE_OPTIONS.includes(mapping.formValue);
  }

  /**
   * Retourne des statistiques sur les mappings d'une liste de professions
   */
  static getMappingStats(professions: string[]): {
    exact: number;
    mapped: number;
    fallback: number;
    total: number;
  } {
    const stats = { exact: 0, mapped: 0, fallback: 0, total: professions.length };

    for (const profession of professions) {
      const mapping = this.map(profession);

      switch (mapping.confidence) {
        case 'exact':
          stats.exact++;
          break;
        case 'mapped':
          stats.mapped++;
          break;
        case 'fallback':
          stats.fallback++;
          break;
      }
    }

    return stats;
  }
}
