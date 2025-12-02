/**
 * Assurland Parser Module
 *
 * Parses lead data from Assurland emails in two formats:
 * - HTML table format
 * - Tab-separated text format
 *
 * Structure:
 * - parser.ts: Main parsing logic
 * - extractors.ts: Field extraction from HTML/text
 * - builders.ts: Object construction
 * - fieldMappings.ts: Field name mappings
 * - utils.ts: Utility functions
 */

export { parseAssurland } from './parser';
