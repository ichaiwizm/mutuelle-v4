/**
 * Main lead parser orchestrator
 * Can work with plain text or email messages
 *
 * Parsing strategy:
 * 1. Try standard parsers (AssurProspect, Assurland)
 * 2. If standard parsers fail, try LLM parsing as fallback
 */

export { parseLead } from "./parsers/single-lead-parser";
export { parseLeads } from "./parsers/batch-lead-parser";
