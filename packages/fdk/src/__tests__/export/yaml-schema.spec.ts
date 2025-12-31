/**
 * YAML schema validation tests
 * Verifies exported YAML matches expected schema structure
 */
import { describe, it, expect } from 'vitest';
import { exportFlow } from '../../main/export';
import { alptisSanteSelectFlow } from '../../main/flows/alptis-sante-select';
import { parseYaml } from '../setup';

describe('YAML Schema Validation', () => {
  const getExportedYaml = () => {
    const result = exportFlow(alptisSanteSelectFlow.toDefinition());
    return parseYaml(result.yaml!);
  };

  describe('Steps structure', () => {
    it('should have steps as array', () => {
      const yaml = getExportedYaml();
      expect(Array.isArray(yaml.steps)).toBe(true);
      expect((yaml.steps as unknown[]).length).toBeGreaterThan(0);
    });

    it('should have required fields on each step', () => {
      const yaml = getExportedYaml();
      const steps = yaml.steps as Record<string, unknown>[];

      for (const step of steps) {
        expect(step).toHaveProperty('id');
        expect(step).toHaveProperty('name');
        expect(step).toHaveProperty('type');
        expect(typeof step.id).toBe('string');
        expect(typeof step.name).toBe('string');
      }
    });

    it('should have valid step types', () => {
      const yaml = getExportedYaml();
      const steps = yaml.steps as Record<string, unknown>[];
      const validTypes = ['auth', 'navigation', 'form-fill', 'extraction', 'custom'];

      for (const step of steps) {
        expect(validTypes).toContain(step.type);
      }
    });
  });

  describe('Selectors structure', () => {
    it('should serialize selectors correctly in form-fill steps', () => {
      const yaml = getExportedYaml();
      const steps = yaml.steps as Record<string, unknown>[];
      const formFillSteps = steps.filter((s) => s.type === 'form-fill');

      for (const step of formFillSteps) {
        if (step.fields) {
          const fields = step.fields as Record<string, unknown>[];
          for (const field of fields) {
            expect(field).toHaveProperty('id');
            expect(field).toHaveProperty('type');
          }
        }
      }
    });

    it('should serialize actions in navigation steps', () => {
      const yaml = getExportedYaml();
      const steps = yaml.steps as Record<string, unknown>[];
      const navSteps = steps.filter((s) => s.type === 'navigation');

      for (const step of navSteps) {
        if (step.actions) {
          const actions = step.actions as Record<string, unknown>[];
          for (const action of actions) {
            expect(action).toHaveProperty('action');
          }
        }
      }
    });
  });

  describe('Metadata structure', () => {
    it('should have metadata object with required fields', () => {
      const yaml = getExportedYaml();
      const metadata = yaml.metadata as Record<string, unknown>;

      expect(metadata).toHaveProperty('name');
      expect(metadata).toHaveProperty('version');
    });
  });
});
