/**
 * Test setup helpers for FDK tests
 */
import { parse } from 'yaml';

export function parseYaml(yamlContent: string): Record<string, unknown> {
  // Strip header comments before parsing
  const contentWithoutHeader = yamlContent
    .split('\n')
    .filter((line) => !line.startsWith('#'))
    .join('\n');
  return parse(contentWithoutHeader);
}

export function extractChecksum(yamlContent: string): string | null {
  const match = yamlContent.match(/# Checksum: ([a-f0-9]{64})/);
  return match ? match[1] : null;
}

export function isValidYaml(content: string): boolean {
  try {
    parseYaml(content);
    return true;
  } catch {
    return false;
  }
}
