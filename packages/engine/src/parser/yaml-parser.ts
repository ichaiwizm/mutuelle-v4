/**
 * YAML Parser with Zod validation for flow definitions
 */
import { parse as parseYaml } from 'yaml';
import { createHash } from 'crypto';
import type { FlowDefinition, FlowValidationResult } from '../types/index.js';
import { flowSchema } from './schemas.js';

export interface ParseOptions {
  validateChecksum?: boolean;
  expectedVersion?: string;
}

export interface ParseResult {
  flow: FlowDefinition;
  checksum: string;
  valid: boolean;
  errors: Array<{ path: string; message: string }>;
}

export class YamlParser {
  private readonly supportedVersions = ['1.0', '1.1', '2.0'];

  /** Parse YAML string to FlowDefinition with validation */
  parse(yamlString: string, options: ParseOptions = {}): ParseResult {
    const checksum = this.computeChecksum(yamlString);
    const rawData = parseYaml(yamlString);
    const validation = this.validate(rawData);

    if (!validation.valid) {
      return { flow: rawData as FlowDefinition, checksum, valid: false, errors: validation.errors };
    }

    const flow = rawData as FlowDefinition;

    if (options.expectedVersion && flow.metadata.version !== options.expectedVersion) {
      return {
        flow, checksum, valid: false,
        errors: [{ path: 'metadata.version', message: `Expected version ${options.expectedVersion}, got ${flow.metadata.version}` }],
      };
    }

    if (!this.isVersionSupported(flow.metadata.version)) {
      return {
        flow, checksum, valid: false,
        errors: [{ path: 'metadata.version', message: `Unsupported version: ${flow.metadata.version}` }],
      };
    }

    return { flow, checksum, valid: true, errors: [] };
  }

  /** Validate flow definition against Zod schema */
  validate(flowDef: unknown): FlowValidationResult {
    const result = flowSchema.safeParse(flowDef);
    if (result.success) {
      return { valid: true, errors: [], warnings: [] };
    }
    const errors = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    return { valid: false, errors, warnings: [] };
  }

  /** Verify checksum matches expected value */
  verifyChecksum(yamlString: string, expectedChecksum: string): boolean {
    return this.computeChecksum(yamlString) === expectedChecksum;
  }

  /** Compute SHA-256 checksum of YAML content */
  computeChecksum(yamlString: string): string {
    return createHash('sha256').update(yamlString, 'utf8').digest('hex');
  }

  /** Check if version is supported */
  private isVersionSupported(version: string): boolean {
    const majorMinor = version.split('.').slice(0, 2).join('.');
    return this.supportedVersions.includes(majorMinor);
  }
}

export const yamlParser = new YamlParser();
