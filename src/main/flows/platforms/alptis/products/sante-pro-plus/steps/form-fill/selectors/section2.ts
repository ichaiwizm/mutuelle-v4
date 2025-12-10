/**
 * Section 2: Adhérent(e)
 * Adapté pour Santé Pro Plus avec:
 * - micro_entrepreneur (NOUVEAU)
 * - ville (NOUVEAU - auto-rempli via code postal)
 * - statut_professionnel (NOUVEAU - conditionnel pour Chefs d'entreprise)
 */
export const SECTION_2_SELECTORS = {
  /**
   * Field 1: Civilité
   * Type: Radio (boutons Monsieur/Madame)
   */
  civilite: {
    primary: "input[name*='form-radio']",
    byValue: (value: 'monsieur' | 'madame') => `input[name*='form-radio'][value='${value}']`,
    fallback: "label:has-text('Civilité')",
    // Alternative: utiliser les boutons directement
    buttons: {
      monsieur: "button:has-text('Monsieur')",
      madame: "button:has-text('Madame')",
    },
  },

  /**
   * Field 2: Nom
   * Type: Text
   */
  nom: {
    primary: '#nom',
    fallback: "input[placeholder='Ex : Durand']",
  },

  /**
   * Field 3: Prénom
   * Type: Text
   */
  prenom: {
    primary: '#prenom',
    fallback: "input[placeholder='Ex : Camille']",
  },

  /**
   * Field 4: Date de naissance
   * Type: Date input
   * Note: C'est le DEUXIÈME champ date sur la page (le premier est date_effet)
   * Contrainte: 18 à 67 ans inclus
   */
  date_naissance: {
    primary: "input[placeholder='Ex : 01/01/2020']",
    note: "Use .nth(1) to get the second date field (first is date_effet)",
  },

  /**
   * Field 5: Catégorie socioprofessionnelle
   * Type: Dropdown (custom Totem select)
   */
  categorie_socioprofessionnelle: {
    primary: '#categories-socio-professionnelles-adherent',
    fallback: "input[placeholder='Sélectionner une catégorie socioprofessionnelle']",
    dropdownOptions: '.totem-select-option__label',
  },

  /**
   * Field 6: Micro-entrepreneur (NOUVEAU pour Santé Pro Plus)
   * Type: Radio (boutons Oui/Non)
   * Toujours visible
   */
  micro_entrepreneur: {
    primary: "input[name*='form-radio']",
    buttons: {
      oui: "button:has-text('Oui')",
      non: "button:has-text('Non')",
    },
    // Le champ se trouve après catégorie socioprofessionnelle
    byLabel: "label:has-text('Micro-entrepreneur')",
  },

  /**
   * Field 7: Cadre d'exercice (CONDITIONNEL)
   * Type: Radio (boutons Salarié/Indépendant)
   * Visible pour: Agriculteurs, Artisans, Chefs d'entreprise, Commerçants, Professions libérales
   */
  cadre_exercice: {
    primary: "input[name*='form-radio']",
    buttons: {
      salarie: "button:has-text('Salarié')",
      independant: "button:has-text('Indépendant Président SASU/SAS')",
    },
    byValue: (value: 'SALARIE' | 'INDEPENDANT_PRESIDENT_SASU_SAS') => {
      const labelText = value === 'SALARIE' ? 'Salarié' : 'Indépendant Président SASU / SAS';
      return `button:has-text("${labelText}")`;
    },
    fallback: "label:has-text('Cadre d\\'exercice')",
  },

  /**
   * Field 8: Statut professionnel (NOUVEAU - CONDITIONNEL)
   * Type: Radio (boutons Artisan-Commerçant/Professions libérales)
   * Visible UNIQUEMENT pour: Chefs d'entreprise
   */
  statut_professionnel: {
    primary: "input[name*='form-radio']",
    buttons: {
      artisan_commercant: "button:has-text('Artisan-Commerçant')",
      professions_liberales: "button:has-text('Professions libérales')",
    },
    byValue: (value: 'ARTISAN_COMMERCANT' | 'PROFESSIONS_LIBERALES') => {
      const labelText = value === 'ARTISAN_COMMERCANT' ? 'Artisan-Commerçant' : 'Professions libérales';
      return `button:has-text("${labelText}")`;
    },
    fallback: "label:has-text('Statut professionnel')",
  },

  /**
   * Field 9: Régime obligatoire
   * Type: Dropdown (custom Totem select)
   */
  regime_obligatoire: {
    primary: '#regime-obligatoire-adherent',
    fallback: "input[placeholder='Sélectionner un régime obligatoire']",
    dropdownOptions: '.totem-select-option__label',
  },

  /**
   * Field 10: Code postal
   * Type: Text
   */
  code_postal: {
    primary: 'input#codePostal',
    fallback: "input[placeholder='Ex : 69001']",
  },

  /**
   * Field 11: Ville (NOUVEAU pour Santé Pro Plus)
   * Type: Dropdown (auto-rempli via code postal)
   * Dépend du code postal
   */
  ville: {
    primary: '#ville',
    fallback: "input[placeholder*='code postal']",
    dropdownOptions: '.totem-select-option__label',
    note: "Auto-populated after code postal is filled",
  },
} as const;
