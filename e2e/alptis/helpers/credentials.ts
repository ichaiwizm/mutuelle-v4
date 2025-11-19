/**
 * Helper pour gérer les credentials de test
 *
 * Les credentials sont lus depuis les variables d'environnement (.env)
 * pour éviter de les commit dans le code.
 *
 * Ce fichier ré-exporte les utilities du config centralisé.
 */

import { getAlptisCredentials as getCredentialsFromConfig, AlptisCredentials, AlptisEnvVars } from '../../../src/main/flows/config';

/**
 * Type pour les credentials de test
 * Alias pour compatibilité avec le code existant
 */
export type TestCredentials = AlptisCredentials;

/**
 * Récupère les credentials Alptis depuis l'environnement
 * Utilise le config centralisé
 */
export const getAlptisCredentials = getCredentialsFromConfig;

/**
 * Vérifie si les credentials de test sont disponibles
 * Utile pour skip les tests si pas de credentials
 */
export function hasAlptisCredentials(): boolean {
  return !!(process.env[AlptisEnvVars.username] && process.env[AlptisEnvVars.password]);
}
