/**
 * Lead form select options
 * Values extracted from email fixtures (AssurProspect & Assurland)
 */

import type { SelectOption } from '@/renderer/components/ui/Select'

export const CIVILITE_OPTIONS: SelectOption[] = [
  { value: 'M.', label: 'M.' },
  { value: 'Mme', label: 'Mme' },
]

export const PROFESSION_OPTIONS: SelectOption[] = [
  { value: 'Salarié', label: 'Salarié' },
  { value: 'Commerçant', label: 'Commerçant' },
  { value: 'Exploitant agricole', label: 'Exploitant agricole' },
  { value: 'Artisan', label: 'Artisan' },
  { value: 'Profession libérale', label: 'Profession libérale' },
  { value: "Chef d'entreprise", label: "Chef d'entreprise" },
  { value: 'Retraité', label: 'Retraité' },
  { value: "En recherche d'emploi", label: "En recherche d'emploi" },
]

export const REGIME_SOCIAL_OPTIONS: SelectOption[] = [
  { value: 'Salarié (ou retraité)', label: 'Salarié (ou retraité)' },
  { value: 'TNS : régime des indépendants', label: 'TNS : régime des indépendants' },
  { value: 'Salarié exploitant agricole', label: 'Salarié exploitant agricole' },
]

export const MOIS_OPTIONS: SelectOption[] = [
  { value: 'Janvier', label: 'Janvier' },
  { value: 'Février', label: 'Février' },
  { value: 'Mars', label: 'Mars' },
  { value: 'Avril', label: 'Avril' },
  { value: 'Mai', label: 'Mai' },
  { value: 'Juin', label: 'Juin' },
  { value: 'Juillet', label: 'Juillet' },
  { value: 'Août', label: 'Août' },
  { value: 'Septembre', label: 'Septembre' },
  { value: 'Octobre', label: 'Octobre' },
  { value: 'Novembre', label: 'Novembre' },
  { value: 'Décembre', label: 'Décembre' },
]

export const FORMULE_OPTIONS: SelectOption[] = [
  { value: 'Intermédiaire', label: 'Intermédiaire' },
  { value: 'Ticket modérateur', label: 'Ticket modérateur' },
]

export const BESOIN_SANTE_OPTIONS: SelectOption[] = [
  { value: 'Changer de contrat', label: 'Changer de contrat' },
  { value: 'Vous assurer pour la première fois', label: 'Vous assurer pour la première fois' },
]

export const OUI_NON_OPTIONS: SelectOption[] = [
  { value: 'Oui', label: 'Oui' },
  { value: 'Non', label: 'Non' },
]

export const COVERAGE_LEVEL_OPTIONS: SelectOption[] = [
  { value: '1', label: '1 - Minimum' },
  { value: '2', label: '2 - Économique' },
  { value: '3', label: '3 - Confort' },
  { value: '4', label: '4 - Maximum' },
]
