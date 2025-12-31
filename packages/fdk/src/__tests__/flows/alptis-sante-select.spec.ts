/**
 * Alptis Sante Select flow definition tests
 */
import { describe, it, expect } from 'vitest';
import { alptisSanteSelectFlow, selectors, transformerConfig } from '../../main/flows/alptis-sante-select';

describe('Alptis Sante Select Flow', () => {
  describe('Flow definition', () => {
    it('should have correct flow id and name', () => {
      expect(alptisSanteSelectFlow.id).toBe('alptis-sante-select');
      expect(alptisSanteSelectFlow.name).toBe('Alptis Sante Select');
      expect(alptisSanteSelectFlow.version).toBe('1.0.0');
    });

    it('should have all required steps defined', () => {
      const stepIds = alptisSanteSelectFlow.steps.map((s) => s.id);
      expect(stepIds).toContain('alptis-auth');
      expect(stepIds).toContain('alptis-navigation');
      expect(stepIds).toContain('alptis-mise-en-place');
      expect(stepIds).toContain('alptis-adherent');
      expect(stepIds).toContain('alptis-conjoint');
      expect(stepIds).toContain('alptis-enfants');
      expect(stepIds).toContain('alptis-submit');
    });

    it('should have 9 steps total', () => {
      expect(alptisSanteSelectFlow.steps).toHaveLength(9);
    });

    it('should convert to valid FlowDefinition', () => {
      const definition = alptisSanteSelectFlow.toDefinition();
      expect(definition.metadata).toBeDefined();
      expect(definition.metadata.name).toBe('Alptis Sante Select');
      expect(definition.steps).toHaveLength(9);
    });
  });

  describe('Selectors', () => {
    it('should have auth selectors defined', () => {
      expect(selectors.auth.usernameInput).toBeDefined();
      expect(selectors.auth.passwordInput).toBeDefined();
      expect(selectors.auth.submitButton).toBeDefined();
    });

    it('should have adherent selectors defined', () => {
      expect(selectors.adherent.civilite).toBeDefined();
      expect(selectors.adherent.nom).toBeDefined();
      expect(selectors.adherent.prenom).toBeDefined();
      expect(selectors.adherent.dateNaissance).toBeDefined();
    });

    it('should have navigation selectors defined', () => {
      expect(selectors.navigation.garantiesButton).toBeDefined();
      expect(selectors.navigation.enregistrerButton).toBeDefined();
    });
  });

  describe('Transformer config', () => {
    it('should have validation rules defined', () => {
      expect(transformerConfig.validations.dateNaissance).toBeDefined();
      expect(transformerConfig.validations.nom).toBeDefined();
      expect(transformerConfig.validations.codePostal).toBeDefined();
    });

    it('should have mappers defined', () => {
      expect(transformerConfig.mappers.profil).toBeDefined();
      expect(transformerConfig.mappers.conjoint).toBeDefined();
      expect(transformerConfig.mappers.enfants).toBeDefined();
    });

    it('should have profession mapper with all types', () => {
      expect(Object.keys(transformerConfig.professionMapper).length).toBeGreaterThan(5);
    });
  });
});
