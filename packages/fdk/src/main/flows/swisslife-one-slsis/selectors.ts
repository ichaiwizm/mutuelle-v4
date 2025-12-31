/**
 * Selectors for SwissLife One SLSIS flow
 * Organized by section with semantic IDs
 */
import type { SelectorWithFallback, SelectorDefinition } from '@mutuelle/engine';

const withFallback = (
  primary: SelectorDefinition,
  fallbacks: SelectorDefinition[] = []
): SelectorWithFallback => ({ primary, fallbacks, timeout: 5000 });

export const selectors = {
  // Auth section
  auth: {
    usernameInput: withFallback({ strategy: 'css', value: '#username' }),
    passwordInput: withFallback({ strategy: 'css', value: '#password' }),
    submitButton: withFallback({ strategy: 'css', value: 'button[type="submit"]' }),
    dashboardIndicator: { strategy: 'css' as const, value: '.dashboard-container' },
  },

  // Navigation
  navigation: {
    iframe: { strategy: 'css' as const, value: '#slsis-iframe' },
    nextButton: { strategy: 'css' as const, value: '#btn-suivant' },
    loader: { strategy: 'css' as const, value: '.loading-spinner' },
  },

  // Section 1: Projet
  projet: {
    nomProjet: withFallback({ strategy: 'css', value: '#nom-projet' }),
  },

  // Section 2: Besoins
  besoins: {
    couvertureSoins: withFallback({ strategy: 'css', value: '#couverture-soins' }),
    indemniteHospitalisation: withFallback({ strategy: 'css', value: '#indemnite-hospitalisation' }),
    indemniteMaladieGrave: withFallback({ strategy: 'css', value: '#indemnite-maladie-grave' }),
  },

  // Section 3: Type simulation
  typeSimulation: {
    typeSimulation: withFallback({ strategy: 'css', value: '#type-simulation' }),
  },

  // Section 4: Assure principal
  assurePrincipal: {
    dateNaissance: withFallback({ strategy: 'css', value: '#date-naissance-assure-principal' }),
    profession: withFallback({ strategy: 'css', value: '#profession-assure-principal' }),
    regime: withFallback({ strategy: 'css', value: '#regime-assure-principal' }),
    statut: withFallback({ strategy: 'css', value: '#statut-assure-principal' }),
    codePostal: withFallback({ strategy: 'css', value: '#code-postal-assure-principal' }),
  },

  // Section 5: Conjoint
  conjoint: {
    dateNaissance: withFallback({ strategy: 'css', value: '#date-naissance-assure-conjoint' }),
    profession: withFallback({ strategy: 'css', value: '#profession-assure-conjoint' }),
    regime: withFallback({ strategy: 'css', value: '#regime-assure-conjoint' }),
    statut: withFallback({ strategy: 'css', value: '#statut-assure-conjoint' }),
  },

  // Section 6: Enfants
  enfants: {
    addButton: { strategy: 'css' as const, value: '#btn-ajouter-enfant' },
    container: { strategy: 'css' as const, value: '.enfants-container' },
    dateNaissance: (idx: number) => `#date-naissance-enfant-${idx}`,
    regime: (idx: number) => `#regime-enfant-${idx}`,
  },

  // Section 7: Gammes et options
  gammesOptions: {
    gamme: withFallback({ strategy: 'css', value: '#gamme' }),
    madelin: withFallback({ strategy: 'css', value: '#madelin' }),
    repriseContrat: withFallback({ strategy: 'css', value: '#reprise-contrat' }),
    resiliation: withFallback({ strategy: 'css', value: '#resiliation' }),
    dateEffet: withFallback({ strategy: 'css', value: '#date-effet' }),
  },
} as const;

export type Selectors = typeof selectors;
