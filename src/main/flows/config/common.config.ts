/**
 * Configuration commune à toutes les plateformes
 *
 * Ce fichier centralise les types et fonctions partagés entre
 * toutes les plateformes (Alptis, SwissLife One, etc.)
 */

/**
 * Environment types
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * Environment-specific behaviors configuration
 */
export type EnvironmentBehaviors = {
  verbose: boolean;              // Enable detailed logging
  screenshotOnError: boolean;    // Capture screenshots on errors
  screenshotOnSuccess: boolean;  // Capture screenshots on successful completions
};

/**
 * Get current environment from NODE_ENV
 * Defaults to 'development' if not set
 */
export function getEnvironment(): Environment {
  const env = process.env.NODE_ENV as Environment;
  return ['development', 'staging', 'production'].includes(env) ? env : 'development';
}
