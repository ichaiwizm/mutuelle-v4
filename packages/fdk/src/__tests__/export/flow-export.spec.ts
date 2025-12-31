/**
 * Flow export validation tests
 * Tests that each flow can be exported to valid YAML
 */
import { describe, it, expect } from 'vitest';
import { exportFlow } from '../../main/export';
import { alptisSanteSelectFlow } from '../../main/flows/alptis-sante-select';
import { swisslifeOneSLSISFlow } from '../../main/flows/swisslife-one-slsis';
import { parseYaml, extractChecksum, isValidYaml } from '../setup';

const flows = [
  { name: 'alptis-sante-select', flow: alptisSanteSelectFlow },
  { name: 'swisslife-one-slsis', flow: swisslifeOneSLSISFlow },
];

describe('Flow Export', () => {
  describe.each(flows)('$name', ({ flow }) => {
    it('should export successfully', () => {
      const result = exportFlow(flow.toDefinition());
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.yaml).toBeDefined();
    });

    it('should produce valid YAML', () => {
      const result = exportFlow(flow.toDefinition());
      expect(result.yaml).toBeDefined();
      expect(isValidYaml(result.yaml!)).toBe(true);
    });

    it('should compute checksum', () => {
      const result = exportFlow(flow.toDefinition());
      expect(result.metadata?.checksum).toBeDefined();
      expect(result.metadata?.checksum).toMatch(/^[a-f0-9]{64}$/);

      const extractedChecksum = extractChecksum(result.yaml!);
      expect(extractedChecksum).toBe(result.metadata?.checksum);
    });

    it('should include required metadata fields', () => {
      const result = exportFlow(flow.toDefinition());
      expect(result.metadata?.version).toBeDefined();
      expect(result.metadata?.exportedAt).toBeDefined();
      expect(result.metadata?.generator).toBe('@mutuelle/fdk');
      expect(result.metadata?.flowId).toBe(flow.name);
      expect(result.metadata?.flowVersion).toBe(flow.version);
    });

    it('should contain all required top-level fields', () => {
      const result = exportFlow(flow.toDefinition());
      const parsed = parseYaml(result.yaml!);

      expect(parsed).toHaveProperty('metadata');
      expect(parsed).toHaveProperty('steps');
      expect(Array.isArray(parsed.steps)).toBe(true);
    });

    it('should include flow metadata in YAML header', () => {
      const result = exportFlow(flow.toDefinition());
      expect(result.yaml).toContain('# Auto-generated flow definition');
      expect(result.yaml).toContain(`# Flow: ${flow.name}`);
      expect(result.yaml).toContain(`# Generator: @mutuelle/fdk`);
    });
  });

  describe('Export consistency', () => {
    it('should produce identical checksums for same flow', () => {
      const result1 = exportFlow(alptisSanteSelectFlow.toDefinition());
      const result2 = exportFlow(alptisSanteSelectFlow.toDefinition());

      // Checksums should match if exported at same content (excluding timestamp)
      expect(result1.metadata?.checksum).toBe(result2.metadata?.checksum);
    });

    it('should export all steps from flow', () => {
      const result = exportFlow(swisslifeOneSLSISFlow.toDefinition());
      const parsed = parseYaml(result.yaml!);
      const steps = parsed.steps as unknown[];

      expect(steps.length).toBe(swisslifeOneSLSISFlow.steps.length);
    });
  });
});
