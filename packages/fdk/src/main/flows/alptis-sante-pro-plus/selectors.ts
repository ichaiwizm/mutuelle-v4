/**
 * Selectors for Alptis Sante Pro Plus flow
 * Organized by section with primary/fallback patterns
 */
import type { SelectorWithFallback, SelectorDefinition } from '@mutuelle/engine';

const withFallback = (
  primary: SelectorDefinition,
  fallbacks: SelectorDefinition[] = []
): SelectorWithFallback => ({
  primary,
  fallbacks,
  timeout: 5000,
});

export const selectors = {
  auth: {
    usernameInput: withFallback(
      { strategy: 'css', value: '#username' },
      [{ strategy: 'css', value: 'input[name="username"]' }]
    ),
    passwordInput: withFallback(
      { strategy: 'css', value: '#password' },
      [{ strategy: 'css', value: 'input[name="password"]' }]
    ),
    submitButton: withFallback(
      { strategy: 'css', value: 'button[type="submit"]' },
      [{ strategy: 'text', value: 'Connexion' }]
    ),
    dashboardIndicator: { strategy: 'css' as const, value: '.dashboard' },
  },

  navigation: {
    newDevisButton: { strategy: 'css' as const, value: '#btn-new-devis' },
    productSanteProPlus: { strategy: 'css' as const, value: '[data-product="sante-pro-plus"]' },
    nextStep: { strategy: 'css' as const, value: '.btn-next' },
    prevStep: { strategy: 'css' as const, value: '.btn-prev' },
    loader: { strategy: 'css' as const, value: '.loading-spinner' },
  },

  miseEnPlace: {
    dateEffet: withFallback(
      { strategy: 'css', value: '#date-effet' },
      [{ strategy: 'label', value: 'Date effet' }]
    ),
    formule: withFallback(
      { strategy: 'css', value: '#formule' },
      [{ strategy: 'css', value: 'select[name="formule"]' }]
    ),
  },

  adherent: {
    civilite: { strategy: 'css' as const, value: '#civilite' },
    nom: { strategy: 'css' as const, value: '#nom' },
    prenom: { strategy: 'css' as const, value: '#prenom' },
    dateNaissance: withFallback(
      { strategy: 'css', value: '#date-naissance' },
      [{ strategy: 'label', value: 'Date de naissance' }]
    ),
    email: { strategy: 'css' as const, value: '#email' },
    telephone: { strategy: 'css' as const, value: '#telephone' },
    adresseRue: { strategy: 'css' as const, value: '#adresse-rue' },
    codePostal: { strategy: 'css' as const, value: '#code-postal' },
    ville: { strategy: 'css' as const, value: '#ville' },
    profession: withFallback(
      { strategy: 'css', value: '#profession' },
      [{ strategy: 'css', value: 'select[name="profession"]' }]
    ),
    regime: { strategy: 'css' as const, value: '#regime' },
    statutProfessionnel: { strategy: 'css' as const, value: '#statut-professionnel' },
    microEntrepreneur: { strategy: 'css' as const, value: '#micro-entrepreneur' },
  },

  conjoint: {
    hasConjoint: { strategy: 'css' as const, value: '#has-conjoint' },
    civilite: { strategy: 'css' as const, value: '#conjoint-civilite' },
    nom: { strategy: 'css' as const, value: '#conjoint-nom' },
    prenom: { strategy: 'css' as const, value: '#conjoint-prenom' },
    dateNaissance: { strategy: 'css' as const, value: '#conjoint-date-naissance' },
    regime: { strategy: 'css' as const, value: '#conjoint-regime' },
  },

  enfants: {
    addEnfant: { strategy: 'css' as const, value: '#add-enfant' },
    removeEnfant: { strategy: 'css' as const, value: '.remove-enfant' },
    nom: { strategy: 'css' as const, value: '.enfant-nom' },
    prenom: { strategy: 'css' as const, value: '.enfant-prenom' },
    dateNaissance: { strategy: 'css' as const, value: '.enfant-date-naissance' },
  },

  submit: {
    calculerDevis: { strategy: 'css' as const, value: '#btn-calculer' },
    validerDevis: { strategy: 'css' as const, value: '#btn-valider' },
    downloadPdf: { strategy: 'css' as const, value: '#btn-download-pdf' },
    resultPrice: { strategy: 'css' as const, value: '.result-price' },
  },
} as const;

export type Selectors = typeof selectors;
