/**
 * AssurProspect Parser Module
 *
 * Parses lead data from AssurProspect emails in two formats:
 * - HTML format (forwarded emails)
 * - Text format (standard emails)
 *
 * Structure:
 * - parser.ts: Main parsing logic
 * - htmlExtractor.ts: HTML field extraction
 * - builders.ts: Object construction
 * - utils.ts: Utility functions
 */

export { parseAssurProspect } from './parser';
