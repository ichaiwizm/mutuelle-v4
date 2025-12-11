import { Key, Users, Zap } from 'lucide-react'
import type { OnboardingStep } from './types'

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'credentialsConfigured',
    title: 'Configurer vos identifiants',
    description: 'Ajoutez vos identifiants Alptis ou SwissLife',
    helpText:
      "Vos identifiants permettent à l'application de se connecter aux plateformes pour remplir les formulaires automatiquement.",
    link: '/config',
    linkLabel: 'Configurer',
    icon: Key,
  },
  {
    id: 'firstLeadCreated',
    title: 'Créer votre premier lead',
    description: 'Ajoutez un prospect manuellement ou importez depuis Gmail',
    helpText:
      "Les leads sont vos prospects. L'application peut les importer depuis vos emails ou vous pouvez les créer manuellement.",
    link: '/leads',
    linkLabel: 'Ajouter un lead',
    icon: Users,
  },
  {
    id: 'firstRunCompleted',
    title: 'Lancer votre première automatisation',
    description: 'Sélectionnez un lead et lancez une exécution',
    helpText:
      "Une exécution remplit automatiquement le formulaire d'adhésion pour le prospect sélectionné.",
    link: '/automation',
    linkLabel: 'Nouvelle exécution',
    icon: Zap,
  },
]
