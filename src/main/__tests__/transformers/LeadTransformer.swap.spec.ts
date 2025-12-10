import { describe, it, expect } from 'vitest';
import { LeadTransformer } from '@/main/flows/platforms/alptis/products/sante-select/transformers/LeadTransformer';
import type { Lead } from '@/shared/types/lead';

describe('LeadTransformer - Eligibility and Swap Logic', () => {
  it('devrait swapper adhérent et conjoint quand adhérent non éligible mais conjoint éligible', () => {
    // Cas : Adhérent salarié < 60 ans (NON éligible)
    //       Conjoint TNS (éligible)
    const lead: Lead = {
      id: 'test-swap-1',
      subscriber: {
        civilite: 'Mme',
        nom: 'Behloul',
        prenom: 'Nassera',
        dateNaissance: '10/08/1968', // 56 ans
        profession: 'Salarié',
        regimeSocial: 'Salarié (ou retraité)',
        codePostal: '75001',
      },
      project: {
        dateEffet: '01/12/2025',
        actuellementAssure: false,
        conjoint: {
          dateNaissance: '15/06/1965', // 59 ans
          profession: 'Commerçant',
          regimeSocial: 'TNS : régime des indépendants',
        },
      },
    } as Lead;

    const result = LeadTransformer.transform(lead);

    // Vérifier que l'adhérent transformé a les caractéristiques du conjoint (swap)
    expect(result.adherent.categorie_socioprofessionnelle).toBe('COMMERCANTS_ET_ASSIMILES'); // Profession du conjoint
    expect(result.adherent.regime_obligatoire).toBe('SECURITE_SOCIALE_INDEPENDANTS'); // Régime TNS
    expect(result.adherent.cadre_exercice).toBe('INDEPENDANT_PRESIDENT_SASU_SAS');

    // Vérifier que le conjoint transformé a les caractéristiques de l'adhérent original
    expect(result.conjoint).toBeDefined();
    expect(result.conjoint?.categorie_socioprofessionnelle).toBe('EMPLOYES_AGENTS_DE_MAITRISE'); // Profession de l'adhérent original
    expect(result.conjoint?.regime_obligatoire).toBe('SECURITE_SOCIALE'); // Régime salarié
  });

  it('devrait swapper : agriculteur salarié vs artisan TNS', () => {
    const lead: Lead = {
      id: 'test-swap-2',
      subscriber: {
        civilite: 'M.',
        nom: 'Calonne',
        prenom: 'Antoine',
        dateNaissance: '10/08/1981', // 43 ans
        profession: 'Exploitant agricole',
        regimeSocial: 'Salarié exploitant agricole',
        codePostal: '95200',
      },
      project: {
        dateEffet: '01/12/2025',
        actuellementAssure: true,
        conjoint: {
          dateNaissance: '15/06/1985', // 39 ans
          profession: 'Artisan',
          regimeSocial: 'TNS : régime des indépendants',
        },
      },
    } as Lead;

    const result = LeadTransformer.transform(lead);

    // Adhérent devrait avoir les caractéristiques du conjoint
    expect(result.adherent.categorie_socioprofessionnelle).toBe('ARTISANS');
    expect(result.adherent.cadre_exercice).toBe('INDEPENDANT_PRESIDENT_SASU_SAS');
    expect(result.adherent.regime_obligatoire).toBe('SECURITE_SOCIALE_INDEPENDANTS');

    // Conjoint devrait avoir les caractéristiques de l'adhérent original
    expect(result.conjoint).toBeDefined();
    expect(result.conjoint?.categorie_socioprofessionnelle).toBe('AGRICULTEURS_EXPLOITANTS');
    expect(result.conjoint?.cadre_exercice).toBe('SALARIE');
  });

  it('ne devrait PAS swapper quand adhérent éligible (TNS)', () => {
    const lead: Lead = {
      id: 'test-no-swap-1',
      subscriber: {
        civilite: 'M.',
        nom: 'Dupont',
        prenom: 'Jean',
        dateNaissance: '10/08/1990', // 34 ans
        profession: 'Chef d\'entreprise',
        regimeSocial: 'TNS : régime des indépendants',
        codePostal: '75001',
      },
      project: {
        dateEffet: '01/12/2025',
        actuellementAssure: false,
        conjoint: {
          dateNaissance: '15/06/1992',
          profession: 'Salarié',
          regimeSocial: 'Salarié (ou retraité)',
        },
      },
    } as Lead;

    const result = LeadTransformer.transform(lead);

    // Adhérent devrait garder ses propres caractéristiques (pas de swap)
    expect(result.adherent.categorie_socioprofessionnelle).toBe('CHEFS_D_ENTREPRISE');
    expect(result.adherent.cadre_exercice).toBe('INDEPENDANT_PRESIDENT_SASU_SAS');

    // Conjoint devrait avoir ses propres caractéristiques
    expect(result.conjoint).toBeDefined();
    expect(result.conjoint?.categorie_socioprofessionnelle).toBe('EMPLOYES_AGENTS_DE_MAITRISE');
  });

  it('ne devrait PAS swapper quand adhérent éligible (60+ ans)', () => {
    const lead: Lead = {
      id: 'test-no-swap-2',
      subscriber: {
        civilite: 'Mme',
        nom: 'Robin',
        prenom: 'Marie-helene',
        dateNaissance: '17/04/1959', // 66 ans
        profession: 'Retraité',
        regimeSocial: 'Salarié (ou retraité)',
        codePostal: '72330',
      },
      project: {
        dateEffet: '01/12/2025',
        actuellementAssure: false,
        conjoint: {
          dateNaissance: '15/06/1959', // 66 ans
          profession: 'Chef d\'entreprise',
          regimeSocial: 'TNS : régime des indépendants',
        },
      },
    } as Lead;

    const result = LeadTransformer.transform(lead);

    // Adhérent devrait garder sa profession (pas de swap)
    expect(result.adherent.categorie_socioprofessionnelle).toBe('RETRAITES');
    expect(result.adherent.regime_obligatoire).toBe('SECURITE_SOCIALE');

    // Conjoint devrait avoir ses propres caractéristiques
    expect(result.conjoint).toBeDefined();
    expect(result.conjoint?.categorie_socioprofessionnelle).toBe('CHEFS_D_ENTREPRISE');
  });

  it('devrait continuer même si aucun n\'est éligible (pas de blocage)', () => {
    const lead: Lead = {
      id: 'test-both-ineligible',
      subscriber: {
        civilite: 'M.',
        nom: 'Young',
        prenom: 'Bob',
        dateNaissance: '10/08/1990', // 34 ans
        profession: 'Salarié',
        regimeSocial: 'Salarié (ou retraité)',
        codePostal: '75001',
      },
      project: {
        dateEffet: '01/12/2025',
        actuellementAssure: false,
        conjoint: {
          dateNaissance: '15/06/1992', // 32 ans
          profession: 'Salarié',
          regimeSocial: 'Salarié (ou retraité)',
        },
      },
    } as Lead;

    // Ne devrait PAS lancer d'erreur
    expect(() => {
      const result = LeadTransformer.transform(lead);
      // Vérifier que la transformation s'est bien faite (même si non éligible)
      expect(result.adherent.categorie_socioprofessionnelle).toBe('EMPLOYES_AGENTS_DE_MAITRISE');
    }).not.toThrow();
  });
});
