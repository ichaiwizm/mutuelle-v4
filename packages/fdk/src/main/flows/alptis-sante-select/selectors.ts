/**
 * Selectors for Alptis Sante Select flow - organized by section
 */
import type { SelectorWithFallback, SelectorDefinition } from '@mutuelle/engine';

const withFallback = (p: SelectorDefinition, f: SelectorDefinition[] = []): SelectorWithFallback =>
  ({ primary: p, fallbacks: f, timeout: 5000 });

export const selectors = {
  auth: {
    usernameInput: withFallback({ strategy: 'css', value: '#username' }, [{ strategy: 'css', value: 'input[name="username"]' }]),
    passwordInput: withFallback({ strategy: 'css', value: '#password' }, [{ strategy: 'css', value: 'input[name="password"]' }]),
    submitButton: withFallback({ strategy: 'css', value: 'button[type="submit"]' }, [{ strategy: 'text', value: 'Se connecter' }]),
    dashboardIndicator: { strategy: 'css' as const, value: '.dashboard-container' },
  },

  miseEnPlace: {
    remplacementContrat: withFallback({ strategy: 'css', value: "[class*='totem-toggle__input']" }, [{ strategy: 'text', value: "Remplacement d'un contrat sante" }]),
    demandeResiliation: {
      primary: { strategy: 'css' as const, value: "input[name*='form-radio']" },
      byValue: (v: 'Oui' | 'Non') => `input[name*='form-radio'][value='${v}']`,
    },
    dateEffet: withFallback({ strategy: 'css', value: "input[placeholder='Ex : 01/01/2020']" }, [{ strategy: 'css', value: 'div.dp__main input.totem-input__input' }]),
  },

  adherent: {
    civilite: {
      primary: { strategy: 'css' as const, value: "input[name*='form-radio']" },
      byValue: (v: 'monsieur' | 'madame') => `input[name*='form-radio'][value='${v}']`,
    },
    nom: { strategy: 'css' as const, value: '#nom' },
    prenom: { strategy: 'css' as const, value: '#prenom' },
    dateNaissance: withFallback({ strategy: 'css', value: "input[placeholder='Ex : 01/01/2020']" }, [{ strategy: 'label', value: 'Date de naissance' }]),
    categorieSocioprofessionnelle: { strategy: 'css' as const, value: '#categories-socio-professionnelles-adherent' },
    cadreExercice: {
      primary: { strategy: 'css' as const, value: "input[name*='form-radio']" },
      byValue: (v: 'SALARIE' | 'INDEPENDANT_PRESIDENT_SASU_SAS') => `label:has-text("${v === 'SALARIE' ? 'Salarie' : 'Independant President SASU / SAS'}")`,
    },
    regimeObligatoire: { strategy: 'css' as const, value: '#regime-obligatoire-adherent' },
    codePostal: { strategy: 'css' as const, value: 'input#codePostal' },
  },

  conjoint: {
    toggle: withFallback({ strategy: 'css', value: "[class*='totem-toggle__input']" }, [{ strategy: 'text', value: 'Conjoint' }]),
    dateNaissance: { strategy: 'css' as const, value: "input[placeholder='Ex : 01/01/2020']" },
    categorieSocioprofessionnelle: { strategy: 'css' as const, value: '#categories-socio-professionnelles-conjoint' },
    cadreExercice: { strategy: 'css' as const, value: '#cadre-exercice-conjoint' },
    regimeObligatoire: { strategy: 'css' as const, value: '#regime-obligatoire-conjoint' },
  },

  enfants: {
    toggle: withFallback({ strategy: 'css', value: "[class*='totem-toggle__input']" }, [{ strategy: 'text', value: 'Enfant' }]),
    ajouterEnfant: { strategy: 'text' as const, value: 'Ajouter un enfant' },
    dateNaissance: { strategy: 'css' as const, value: "input[placeholder='Ex : 01/01/2020']" },
    regimeObligatoire: { strategy: 'css' as const, value: '#regime-obligatoire-enfant' },
  },

  navigation: {
    garantiesButton: { strategy: 'text' as const, value: 'Garanties' },
    enregistrerButton: { strategy: 'text' as const, value: 'Enregistrer' },
    confirmerButton: { strategy: 'text' as const, value: 'Enregistrer et continuer' },
    loader: { strategy: 'css' as const, value: '.loading-spinner' },
  },
} as const;

export type Selectors = typeof selectors;
