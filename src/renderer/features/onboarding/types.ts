import type { LucideIcon } from 'lucide-react'

export interface OnboardingState {
  hasSeenOnboarding: boolean
  onboardingDismissed: boolean
  completedAt: Record<string, number>
}

export interface OnboardingStep {
  id: 'credentialsConfigured' | 'firstLeadCreated' | 'firstRunCompleted'
  title: string
  description: string
  helpText: string
  link: string
  linkLabel: string
  icon: LucideIcon
}

export const ONBOARDING_STORAGE_KEY = 'mutuelle_onboarding'
