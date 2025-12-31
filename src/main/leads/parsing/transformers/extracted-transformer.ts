/**
 * Extracted lead data to Lead transformer
 */

import type { Lead } from "@/shared/types/lead";
import type { ExtractedLead } from "../types";
import { generateLeadId } from "../utils/lead-id-generator";

/**
 * Transforms ExtractedLead to Lead format for database
 */
export function transformToLead(
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
        source: metadata?.source || "manual",
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
