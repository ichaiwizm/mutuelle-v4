/**
 * SwissLife One SLSIS flow definition tests
 */
import { describe, it, expect } from 'vitest';
import { swisslifeOneSLSISFlow, selectors } from '../../main/flows/swisslife-one-slsis';

describe('SwissLife One SLSIS Flow', () => {
  describe('Flow definition', () => {
    it('should have correct flow id and name', () => {
      expect(swisslifeOneSLSISFlow.id).toBe('swisslife-one-slsis');
      expect(swisslifeOneSLSISFlow.name).toBe('SwissLife One SLSIS');
      expect(swisslifeOneSLSISFlow.version).toBe('1.0.0');
    });

    it('should have exactly 10 steps defined', () => {
      expect(swisslifeOneSLSISFlow.steps).toHaveLength(10);
    });

    it('should have all required step ids', () => {
      const stepIds = swisslifeOneSLSISFlow.steps.map((s) => s.id);
      const expectedSteps = [
        'swisslife-auth',
        'swisslife-navigation',
        'swisslife-projet',
        'swisslife-besoins',
        'swisslife-type-simulation',
        'swisslife-assure-principal',
        'swisslife-conjoint',
        'swisslife-enfants',
        'swisslife-gammes-options',
        'swisslife-submit',
      ];
      for (const expected of expectedSteps) {
        expect(stepIds).toContain(expected);
      }
    });
  });

  describe('Iframe handling', () => {
    it('should have iframe selector in navigation selectors', () => {
      expect(selectors.navigation.iframe).toBeDefined();
      expect(selectors.navigation.iframe.value).toBe('#slsis-iframe');
    });

    it('should have navigation step with iframe actions', () => {
      const navStep = swisslifeOneSLSISFlow.steps.find((s) => s.id === 'swisslife-navigation');
      expect(navStep).toBeDefined();
      expect(navStep?.type).toBe('navigation');

      if ('actions' in navStep!) {
        const actions = navStep.actions;
        const iframeAction = actions.find((a) => a.action === 'switchToIframe');
        expect(iframeAction).toBeDefined();
      }
    });
  });

  describe('Selectors', () => {
    it('should have all section selectors defined', () => {
      expect(selectors.auth).toBeDefined();
      expect(selectors.navigation).toBeDefined();
      expect(selectors.projet).toBeDefined();
      expect(selectors.besoins).toBeDefined();
      expect(selectors.assurePrincipal).toBeDefined();
      expect(selectors.conjoint).toBeDefined();
      expect(selectors.enfants).toBeDefined();
      expect(selectors.gammesOptions).toBeDefined();
    });

    it('should have enfants selectors with index functions', () => {
      expect(typeof selectors.enfants.dateNaissance).toBe('function');
      expect(selectors.enfants.dateNaissance(0)).toBe('#date-naissance-enfant-0');
      expect(selectors.enfants.dateNaissance(2)).toBe('#date-naissance-enfant-2');
    });
  });
});
