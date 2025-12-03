import type { Lead } from "@/shared/types/lead";

/**
 * Format duration in human-readable format
 */
export function formatEstimatedTime(ms: number): string {
  if (ms < 60000) return "< 1 min";
  const minutes = Math.ceil(ms / 60000);
  if (minutes < 60) return `~${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `~${hours}h`;
  return `~${hours}h ${remainingMinutes}min`;
}

/**
 * Get lead display name
 */
export function getLeadDisplayName(lead: Lead): string {
  const nom = lead.subscriber?.nom ?? "";
  const prenom = lead.subscriber?.prenom ?? "";
  return `${prenom} ${nom}`.trim() || "Lead sans nom";
}

/**
 * Get lead subtitle
 */
export function getLeadSubtitle(lead: Lead): string {
  const dateNaissance = lead.subscriber?.dateNaissance ?? "";
  const codePostal = lead.subscriber?.codePostal ?? "";
  return [dateNaissance, codePostal].filter(Boolean).join(" - ");
}
