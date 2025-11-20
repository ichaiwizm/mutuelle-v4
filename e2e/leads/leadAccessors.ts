/**
 * Safe accessors for lead properties
 */
import type { Lead } from '@/shared/types/lead';

/**
 * Get subscriber property safely
 */
function getSubscriberProp(lead: Lead, key: string): unknown {
  return (lead.subscriber as Record<string, unknown>)[key];
}

/**
 * Get project property safely
 */
function getProjectProp(lead: Lead, key: string): unknown {
  const project = lead.project as Record<string, unknown> | undefined;
  return project?.[key];
}

/**
 * Check if a lead has a conjoint
 */
export function hasConjoint(lead: Lead): boolean {
  const conjoint = getProjectProp(lead, 'conjoint') as Record<string, unknown> | undefined;
  return !!conjoint?.dateNaissance;
}

/**
 * Get number of children
 */
export function getChildrenCount(lead: Lead): number {
  return lead.children?.length || 0;
}

/**
 * Get profession display name
 */
export function getProfession(lead: Lead): string {
  const profession = getSubscriberProp(lead, 'profession');
  return typeof profession === 'string' ? profession : 'Non spécifié';
}

/**
 * Get regime social
 */
export function getRegimeSocial(lead: Lead): string {
  const regime = getSubscriberProp(lead, 'regimeSocial');
  return typeof regime === 'string' ? regime : '';
}

/**
 * Get regime type (Salarié vs TNS/Indépendant)
 */
export function getRegimeType(lead: Lead): 'SALARIE' | 'TNS_INDEPENDANT' | 'UNKNOWN' {
  const regimeSocial = getRegimeSocial(lead).toLowerCase();

  if (regimeSocial.includes('tns') ||
      regimeSocial.includes('indépendant') ||
      regimeSocial.includes('independant')) {
    return 'TNS_INDEPENDANT';
  }

  if (regimeSocial.includes('salarié') || regimeSocial.includes('salarie')) {
    return 'SALARIE';
  }

  return 'UNKNOWN';
}

/**
 * Get subscriber name for display
 */
export function getSubscriberName(lead: Lead): string {
  const nom = getSubscriberProp(lead, 'nom');
  const prenom = getSubscriberProp(lead, 'prenom');
  const nomStr = typeof nom === 'string' ? nom : '';
  const prenomStr = typeof prenom === 'string' ? prenom : '';
  return `${prenomStr} ${nomStr}`.trim() || 'Anonyme';
}

/**
 * Get subscriber civilite
 */
export function getCivilite(lead: Lead): string {
  const civilite = getSubscriberProp(lead, 'civilite');
  const civiliteStr = typeof civilite === 'string' ? civilite.toLowerCase() : '';

  if (civiliteStr.includes('mme') || civiliteStr.includes('madame')) return 'Mme';
  if (civiliteStr.includes('m.') || civiliteStr.includes('monsieur')) return 'M.';

  return typeof civilite === 'string' ? civilite : '';
}
