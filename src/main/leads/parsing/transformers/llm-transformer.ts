/**
 * LLM data to Lead transformer
 */

import type { Lead } from "@/shared/types/lead";
import type { ParsedLeadData } from "@/main/services/llm";
import { generateLeadId } from "../utils/lead-id-generator";

/**
 * Transforms LLM parsed data to Lead format
 */
export function transformLLMDataToLead(
  data: ParsedLeadData,
  metadata?: { emailId?: string; source?: string }
): Lead {
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
  Object.keys(subscriber).forEach((key) => {
    if (subscriber[key] === undefined) delete subscriber[key];
  });

  const project: Record<string, unknown> = {
    dateEffet: data.dateEffet,
    source: metadata?.source || "llm",
    ...(metadata?.emailId && { emailId: metadata.emailId }),
    ...(data.conjoint && { conjoint: data.conjoint }),
  };

  Object.keys(project).forEach((key) => {
    if (project[key] === undefined) delete project[key];
  });

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
