/**
 * Main lead parser orchestrator
 * Can work with plain text or email messages
 */

import { randomUUID } from 'crypto';
import type { Lead } from '@/shared/types/lead';
import { isLead, detectProvider, type LeadInput } from '../detection/detector';
import { parseAssurProspect } from './assurprospect';
import { parseAssurland } from './assurland';
import { splitEmailIntoLeadBlocks } from './extractors';
import type { ParseResult, ExtractedLead } from './types';

/**
 * Parses text/email and returns a Lead object ready for database
 * Returns null if input is not a valid lead or parsing fails
 *
 * @param input - Can be plain text string or object with text and optional subject/id
 * @param metadata - Optional metadata (emailId, source) to include in the lead
 */
export function parseLead(
  input: string | LeadInput,
  metadata?: { emailId?: string; source?: string }
): Lead | null {
  // Check if input is a valid lead
  if (!isLead(input)) {
    return null;
  }

  // Detect provider
  const detection = detectProvider(input);
  if (detection.provider === 'Unknown') {
    return null;
  }

  // Get text from input
  const text = typeof input === 'string' ? input : input.text;

  // Parse based on provider
  let result: ParseResult;
  if (detection.provider === 'AssurProspect') {
    result = parseAssurProspect(text);
  } else if (detection.provider === 'Assurland') {
    result = parseAssurland(text);
  } else {
    // Unknown provider
    return null;
  }

  // Check parsing success
  if (!result.success || !result.data) {
    return null;
  }

  // Transform to Lead format
  return transformToLead(result.data, metadata);
}

/**
 * Transforms ExtractedLead to Lead format for database
 */
function transformToLead(
  extracted: ExtractedLead,
  metadata?: { emailId?: string; source?: string }
): Lead {
  const { contact, souscripteur, conjoint, enfants, besoin } = extracted;

  // Build subscriber object (merge contact + souscripteur)
  const subscriber: Record<string, unknown> = {
    ...contact,
    ...souscripteur,
  };

  // Build project object (besoin + optional conjoint)
  const project: Record<string, unknown> | undefined = besoin
    ? {
        ...besoin,
        ...(conjoint && { conjoint }),
        source: metadata?.source || 'manual',
        ...(metadata?.emailId && { emailId: metadata.emailId }),
      }
    : undefined;

  // Build children array
  const children = enfants?.map((child) => ({
    dateNaissance: child.dateNaissance,
    ...(child.order && { order: child.order }),
  }));

  return {
    id: randomUUID(),
    subscriber,
    ...(project && { project }),
    ...(children && children.length > 0 && { children }),
  };
}

/**
 * Batch parse multiple text/email inputs
 * OR parse a single email that may contain multiple leads
 */
export function parseLeads(
  inputs: Array<string | LeadInput> | string | LeadInput,
  metadata?: { emailId?: string; source?: string }
): Lead[] {
  // If single input, try multiple parsing strategies
  if (!Array.isArray(inputs)) {
    const text = typeof inputs === 'string' ? inputs : inputs.text;
    const subject = typeof inputs === 'string' ? undefined : inputs.subject;

    // Strategy 1: Try to split into multiple lead blocks (AssurProspect multi-lead format)
    const blocks = splitEmailIntoLeadBlocks(text);
    if (blocks.length > 0) {
      return blocks
        .map(block => parseLead(block, metadata))
        .filter((lead): lead is Lead => lead !== null);
    }

    // Strategy 2: Try to parse as a single lead (Assurland or other formats)
    const singleLead = parseLead({ text, subject }, metadata);
    if (singleLead) {
      return [singleLead];
    }

    return [];
  }

  // Legacy: array of inputs
  return inputs
    .map(input => parseLead(input, metadata))
    .filter((lead): lead is Lead => lead !== null);
}
