import { describe, it, expect } from 'vitest';
import {
  calculateAge,
  isEligibleAsMainSubscriber,
  determineEligibility,
} from '@/main/flows/platforms/alptis/products/sante-select/transformers/validators/eligibility-validator';
import type { Lead } from '@/shared/types/lead';

describe('eligibility-validator', () => {
  describe('calculateAge', () => {
    it('devrait calculer l\'âge correctement', () => {
      // Date de naissance: 10/08/1976 (48 ans en 2024)
      const age = calculateAge('10/08/1976');
      expect(age).toBeGreaterThanOrEqual(48);
    });

    it('devrait gérer les anniversaires non encore passés', () => {
      const today = new Date();
      const futureMonth = today.getMonth() + 2;
      const year = today.getFullYear() - 30;
      // Format DD/MM/YYYY avec padding
      const month = String((futureMonth % 12) + 1).padStart(2, '0');
      const dateNaissance = `15/${month}/${year}`;
      const age = calculateAge(dateNaissance);
      expect(age).toBeLessThanOrEqual(30);
    });
  });

  describe('isEligibleAsMainSubscriber', () => {
    it('devrait être éligible si âge >= 60', () => {
      const result = isEligibleAsMainSubscriber(
        '10/08/1960', // 64 ans
        'Salarié',
        'Salarié (ou retraité)'
      );
      expect(result.eligible).toBe(true);
      expect(result.reason).toContain('60');
    });

    it('devrait être éligible si régime TNS (peu importe l\'âge)', () => {
      const result = isEligibleAsMainSubscriber(
        '10/08/1990', // 34 ans
        'Chef d\'entreprise',
        'TNS : régime des indépendants'
      );
      expect(result.eligible).toBe(true);
      expect(result.reason).toContain('TNS');
    });

    it('devrait être éligible si régime contient "indépendant"', () => {
      const result = isEligibleAsMainSubscriber(
        '10/08/1990',
        'Artisan',
        'Sécurité sociale des indépendants'
      );
      expect(result.eligible).toBe(true);
      expect(result.reason).toContain('indépendant');
    });

    it('ne devrait PAS être éligible si âge < 60 ET régime salarié', () => {
      const result = isEligibleAsMainSubscriber(
        '10/08/1990', // 34 ans
        'Salarié',
        'Salarié (ou retraité)'
      );
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('Non éligible');
    });

    it('ne devrait PAS être éligible : agriculteur salarié < 60 ans', () => {
      const result = isEligibleAsMainSubscriber(
        '10/08/1990',
        'Exploitant agricole',
        'Salarié exploitant agricole'
      );
      expect(result.eligible).toBe(false);
    });

    it('devrait être éligible : agriculteur TNS', () => {
      const result = isEligibleAsMainSubscriber(
        '10/08/1990',
        'Exploitant agricole',
        'MSA : régime agricole des indépendants'
      );
      expect(result.eligible).toBe(true);
    });

    it('devrait être éligible : retraité de 66 ans', () => {
      const result = isEligibleAsMainSubscriber(
        '10/08/1958', // 66 ans
        'Retraité',
        'Salarié (ou retraité)'
      );
      expect(result.eligible).toBe(true);
    });

    it('ne devrait PAS être éligible : retraité anticipé de 58 ans', () => {
      const result = isEligibleAsMainSubscriber(
        '10/08/1966', // 58 ans
        'Retraité',
        'Salarié (ou retraité)'
      );
      expect(result.eligible).toBe(false);
    });
  });

  describe('determineEligibility', () => {
    it('devrait indiquer que l\'adhérent est éligible (TNS)', () => {
      const lead: Lead = {
        id: 'test-1',
        subscriber: {
          civilite: 'M.',
          nom: 'Test',
          prenom: 'User',
          dateNaissance: '10/08/1990',
          profession: 'Chef d\'entreprise',
          regimeSocial: 'TNS : régime des indépendants',
          codePostal: '75001',
        },
        project: {
          dateEffet: '01/12/2025',
          actuellementAssure: false,
        },
      } as Lead;

      const result = determineEligibility(lead);
      expect(result.subscriberEligible).toBe(true);
      expect(result.shouldSwap).toBe(false);
    });

    it('devrait indiquer que l\'adhérent est éligible (60+ ans)', () => {
      const lead: Lead = {
        id: 'test-2',
        subscriber: {
          civilite: 'M.',
          nom: 'Test',
          prenom: 'Senior',
          dateNaissance: '10/08/1960', // 64 ans
          profession: 'Salarié',
          regimeSocial: 'Salarié (ou retraité)',
          codePostal: '75001',
        },
        project: {
          dateEffet: '01/12/2025',
          actuellementAssure: false,
        },
      } as Lead;

      const result = determineEligibility(lead);
      expect(result.subscriberEligible).toBe(true);
      expect(result.shouldSwap).toBe(false);
    });

    it('devrait indiquer un swap nécessaire (adhérent non éligible, conjoint éligible)', () => {
      const lead: Lead = {
        id: 'test-3',
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

      const result = determineEligibility(lead);
      expect(result.subscriberEligible).toBe(false);
      expect(result.conjointEligible).toBe(true);
      expect(result.shouldSwap).toBe(true);
    });

    it('devrait indiquer que ni l\'un ni l\'autre n\'est éligible', () => {
      const lead: Lead = {
        id: 'test-4',
        subscriber: {
          civilite: 'M.',
          nom: 'Test',
          prenom: 'Junior',
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

      const result = determineEligibility(lead);
      expect(result.subscriberEligible).toBe(false);
      expect(result.conjointEligible).toBe(false);
      expect(result.shouldSwap).toBe(false);
    });

    it('devrait gérer le cas sans conjoint', () => {
      const lead: Lead = {
        id: 'test-5',
        subscriber: {
          civilite: 'M.',
          nom: 'Solo',
          prenom: 'Jean',
          dateNaissance: '10/08/1960', // 64 ans
          profession: 'Retraité',
          regimeSocial: 'Salarié (ou retraité)',
          codePostal: '75001',
        },
        project: {
          dateEffet: '01/12/2025',
          actuellementAssure: false,
        },
      } as Lead;

      const result = determineEligibility(lead);
      expect(result.subscriberEligible).toBe(true);
      expect(result.conjointEligible).toBe(false);
      expect(result.shouldSwap).toBe(false);
    });

    it('cas réel : agriculteur salarié vs artisan TNS → devrait swapper', () => {
      const lead: Lead = {
        id: 'test-6',
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

      const result = determineEligibility(lead);
      expect(result.subscriberEligible).toBe(false);
      expect(result.conjointEligible).toBe(true);
      expect(result.shouldSwap).toBe(true);
    });
  });
});
