/**
 * Transformateur du projet pour SwissLifeOne
 * Gère la génération auto du nom de projet, besoins, type simulation, et gammes/options
 */

import type { Lead } from '@/shared/types/lead';
import type {
  ProjetData,
  BesoinsData,
  TypeSimulation,
  GammesOptionsData,
  SwissLifeRegime,
} from '../types';
import { transformDateEffet } from './date-transformer';
import { mapGamme } from '../mappers/gamme-mapper';
import { isTNSRegime } from '../mappers/regime-mapper';

/**
 * Génère automatiquement un nom de projet
 * Format: "Projet {nom} {prenom} {YYYYMMDD}"
 *
 * @param lead - Lead contenant subscriber.nom et subscriber.prenom
 * @returns Nom de projet formatté
 */
export function generateProjectName(lead: Lead): string {
  const nom = lead.subscriber.nom || 'Inconnu';
  const prenom = lead.subscriber.prenom || 'Inconnu';

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const projectName = `Projet ${nom} ${prenom} ${dateStr}`;
  console.log('[PROJECT] Generated project name:', projectName);

  return projectName;
}

/**
 * Transforme les données du projet
 *
 * @param lead - Lead complet
 * @returns Données projet formattées
 */
export function transformProjet(lead: Lead): ProjetData {
  console.log('[PROJECT] Transforming project data...');
  console.log('[PROJECT] Input:', {
    nom: lead.subscriber.nom,
    prenom: lead.subscriber.prenom,
  });

  const transformed = {
    nom_projet: generateProjectName(lead),
  };

  console.log('[PROJECT] Output:', transformed);

  return transformed;
}

/**
 * Transforme les besoins avec valeurs par défaut
 *
 * @returns Besoins formattés avec defaults
 */
export function transformBesoins(): BesoinsData {
  console.log('[PROJECT] Setting default besoins...');

  const besoins = {
    besoin_couverture_individuelle: true, // Default: true
    besoin_indemnites_journalieres: false, // Default: false
  };

  console.log('[PROJECT] Besoins:', besoins);

  return besoins;
}

/**
 * Détermine le type de simulation basé sur la présence du conjoint
 *
 * @param lead - Lead complet
 * @returns Type de simulation
 */
export function determineTypeSimulation(lead: Lead): TypeSimulation {
  const hasConjoint = !!lead.project?.conjoint && !!lead.project.conjoint.dateNaissance;
  const typeSimulation = hasConjoint ? 'POUR_LE_COUPLE' : 'INDIVIDUEL';

  console.log(`[PROJECT] Type simulation: ${typeSimulation} (conjoint: ${hasConjoint ? '✓' : '✗'})`);

  return typeSimulation;
}

/**
 * Transforme les gammes et options
 *
 * @param lead - Lead complet
 * @param regimeSubscriber - Régime social de l'assuré principal (pour Loi Madelin)
 * @returns Gammes et options formattées
 */
export function transformGammesOptions(
  lead: Lead,
  regimeSubscriber: SwissLifeRegime
): GammesOptionsData {
  console.log('[PROJECT] Transforming gammes and options...');
  console.log('[PROJECT] Input:', {
    gamme: lead.project?.gamme,
    dateEffet: lead.project?.dateEffet,
    regimeSubscriber,
  });

  // Gamme: Default = SwissLife Santé
  const gamme = mapGamme(lead.project?.gamme as string | undefined);

  // Date d'effet: depuis lead.project.dateEffet ou calculée
  const dateEffet = transformDateEffet(lead.project?.dateEffet as string | undefined);

  // Loi Madelin: true si TNS uniquement
  const loiMadelin = isTNSRegime(regimeSubscriber);
  if (loiMadelin) {
    console.log('[PROJECT] ✓ Loi Madelin eligible (TNS regime)');
  } else {
    console.log('[PROJECT] → Loi Madelin not eligible (non-TNS regime)');
  }

  // Reprise iso garanties: default = true
  const repriseIsoGaranties = true;

  // Résiliation à effectuer: default = false
  const resiliationAEffectuer = false;

  const transformed = {
    gamme,
    date_effet: dateEffet,
    loi_madelin: loiMadelin,
    reprise_iso_garanties: repriseIsoGaranties,
    resiliation_a_effectuer: resiliationAEffectuer,
  };

  console.log('[PROJECT] Output:', transformed);

  return transformed;
}
