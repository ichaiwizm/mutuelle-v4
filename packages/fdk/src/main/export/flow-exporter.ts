/**
 * Flow Exporter
 * Converts TypeScript flow definitions to YAML format with metadata and checksum
 */
import { createHash } from 'crypto';
import { stringify } from 'yaml';
import type { FlowDefinition } from '@mutuelle/engine';
import { serializeFlow } from './serializer';
import { validate, type ValidationError } from './validator';

export interface ExportMetadata {
  version: string;
  exportedAt: string;
  checksum: string;
  generator: string;
  flowId: string;
  flowVersion: string;
}

export interface ExportResult {
  success: boolean;
  yaml?: string;
  metadata?: ExportMetadata;
  errors: ValidationError[];
  warnings: ValidationError[];
}

const EXPORTER_VERSION = '1.0.0';
const GENERATOR_NAME = '@mutuelle/fdk';

function computeChecksum(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

function generateHeader(metadata: ExportMetadata): string {
  return [
    '# Auto-generated flow definition',
    `# Generator: ${metadata.generator}`,
    `# Version: ${metadata.version}`,
    `# Exported: ${metadata.exportedAt}`,
    `# Checksum: ${metadata.checksum}`,
    `# Flow: ${metadata.flowId} v${metadata.flowVersion}`,
    '',
  ].join('\n');
}

export function exportFlow(flowDef: FlowDefinition): ExportResult {
  const validationErrors = validate(flowDef);
  const errors = validationErrors.filter((e) => e.severity === 'error');
  const warnings = validationErrors.filter((e) => e.severity === 'warning');

  if (errors.length > 0) {
    return { success: false, errors, warnings };
  }

  const serialized = serializeFlow(flowDef);
  const yamlContent = stringify(serialized, {
    indent: 2,
    lineWidth: 120,
    defaultStringType: 'QUOTE_DOUBLE',
    defaultKeyType: 'PLAIN',
  });

  const checksum = computeChecksum(yamlContent);

  const metadata: ExportMetadata = {
    version: EXPORTER_VERSION,
    exportedAt: new Date().toISOString(),
    checksum,
    generator: GENERATOR_NAME,
    flowId: flowDef.metadata.name,
    flowVersion: flowDef.metadata.version,
  };

  const header = generateHeader(metadata);
  const yaml = header + yamlContent;

  return {
    success: true,
    yaml,
    metadata,
    errors: [],
    warnings,
  };
}

export { validate } from './validator';
export { serializeFlow, serializeStep, serializeAction } from './serializer';
export type { ValidationError } from './validator';
