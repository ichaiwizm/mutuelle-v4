/**
 * Main lead parser orchestrator
 * Can work with plain text or email messages
 *
 * Parsing strategy:
 * 1. Try standard parsers (AssurProspect, Assurland)
 * 2. If standard parsers fail, try LLM parsing as fallback
 */

import { createHash } from 'crypto';
import type { Lead } from '@/shared/types/lead';
import { isLead, detectProvider, type LeadInput } from '../detection/detector';
import { parseAssurProspect } from './assurprospect';
import { parseAssurland } from './assurland';
import { splitEmailIntoLeadBlocks } from './extractors';
import type { ParseResult, ExtractedLead } from './types';
import { parseLeadWithLLM, isLLMParsingAvailable, type ParsedLeadData } from '@/main/services/llm';

/**
 * Generates a deterministic UUID-like ID from subscriber data
 * Same lead data = same ID, enabling deduplication via primary key
 */
function generateLeadId(subscriber: Record<string, unknown>): string {
  const key = [
    subscriber.nom,
    subscriber.prenom,
    subscriber.email,
    subscriber.telephone,
    subscriber.dateNaissance,
  ].filter(Boolean).map(v => String(v).toLowerCase().trim()).join('|');

  const hash = createHash('sha256').update(key).digest('hex');
  // Format as UUID v4-like: xxxxxxxx-xxxx-4xxx-axxx-xxxxxxxxxxxx
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

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
 * Transforms LLM parsed data to Lead format
 */
function transformLLMDataToLead(
  data: ParsedLeadData,
  metadata?: { emailId?: string; source?: string }
): Lead {
  // Build subscriber object
  const subscriber: Record<string, unknown> = {
    civilite: data.civilite,
    nom: data.nom,
    prenom: data.prenom,
    email: data.email,
    telephone: data.telephone,
    dateNaissance: data.dateNaissance,
    codePostal: data.codePostal,
    ville: data.ville,
    adresse: data.adresse,
    regimeSocial: data.regimeSocial,
    profession: data.profession,
  };

  // Remove undefined values
  Object.keys(subscriber).forEach(key => {
    if (subscriber[key] === undefined) {
      delete subscriber[key];
    }
  });

  // Build project object
  const project: Record<string, unknown> = {
    dateEffet: data.dateEffet,
    source: metadata?.source || 'llm',
    ...(metadata?.emailId && { emailId: metadata.emailId }),
    ...(data.conjoint && { conjoint: data.conjoint }),
  };

  // Remove undefined values from project
  Object.keys(project).forEach(key => {
    if (project[key] === undefined) {
      delete project[key];
    }
  });

  // Build children array
  const children = data.enfants?.map((child, index) => ({
    dateNaissance: child.dateNaissance,
    regimeSocial: child.regimeSocial,
    order: index + 1,
  }));

  return {
    id: generateLeadId(subscriber),
    subscriber,
    ...(Object.keys(project).length > 1 && { project }),
    ...(children && children.length > 0 && { children }),
  };
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
    id: generateLeadId(subscriber),
    subscriber,
    ...(project && { project }),
    ...(children && children.length > 0 && { children }),
  };
}

/**
 * Batch parse multiple text/email inputs
 * OR parse a single email that may contain multiple leads
 *
 * Uses standard parsers first, then LLM as fallback
 */
export async function parseLeads(
  inputs: Array<string | LeadInput> | string | LeadInput,
  metadata?: { emailId?: string; source?: string }
): Promise<Lead[]> {
  // If single input, try multiple parsing strategies
  if (!Array.isArray(inputs)) {
    const text = typeof inputs === 'string' ? inputs : inputs.text;
    const subject = typeof inputs === 'string' ? undefined : inputs.subject;

    // Strategy 1: Try to split into multiple lead blocks (AssurProspect multi-lead format)
    const blocks = splitEmailIntoLeadBlocks(text);
    if (blocks.length > 0) {
      const leads = blocks
        .map(block => parseLead(block, metadata))
        .filter((lead): lead is Lead => lead !== null);
      if (leads.length > 0) {
        return leads;
      }
    }

    // Strategy 2: Try to parse as a single lead (Assurland or other formats)
    const singleLead = parseLead({ text, subject }, metadata);
    if (singleLead) {
      return [singleLead];
    }

    // Strategy 3: Try LLM parsing as fallback
    if (isLLMParsingAvailable()) {
      const llmData = await parseLeadWithLLM(text);
      if (llmData) {
        const llmLead = transformLLMDataToLead(llmData, metadata);
        return [llmLead];
      }
    }

    return [];
  }

  // Legacy: array of inputs
  const leads = await Promise.all(
    inputs.map(async input => {
      const lead = parseLead(input, metadata);
      if (lead) return lead;

      // Try LLM fallback for each input
      if (isLLMParsingAvailable()) {
        const text = typeof input === 'string' ? input : input.text;
        const llmData = await parseLeadWithLLM(text);
        if (llmData) {
          return transformLLMDataToLead(llmData, metadata);
        }
      }
      return null;
    })
  );

  return leads.filter((lead): lead is Lead => lead !== null);
}
