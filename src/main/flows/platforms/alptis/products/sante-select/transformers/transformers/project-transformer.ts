/**
 * Transformateur pour les données du projet
 */

import type { Lead } from '../types';
import { transformDateEffet } from './date-transformer';

/**
 * Transforme les données du projet (mise en place du contrat)
 */
export function transformProject(lead: Lead) {
  const project = lead.project;

  console.log('[PROJECT] Transforming project data...');
  console.log('[PROJECT] Input:', {
    dateEffet: project?.dateEffet,
    actuellementAssure: project?.actuellementAssure,
  });

  const remplacementContrat = false;

  const transformed = {
    remplacement_contrat: remplacementContrat,
    demande_resiliation: remplacementContrat ? ('Non' as const) : undefined,
    date_effet: transformDateEffet(project?.dateEffet),
  };

  console.log('[PROJECT] Output:', transformed);

  return transformed;
}
