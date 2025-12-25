import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import { useDashboardContext } from '@/renderer/contexts/DashboardContext'
import { ONBOARDING_STEPS } from '../constants'
import { ONBOARDING_STORAGE_KEY, type OnboardingState, type OnboardingStep } from '../types'

interface OnboardingContextValue {
  state: OnboardingState
  steps: Array<OnboardingStep & { completed: boolean }>
  isComplete: boolean
  isDismissed: boolean
  completedCount: number
  totalSteps: number
  dismissOnboarding: () => void
  resetOnboarding: () => void
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

function loadStoredState(): Partial<OnboardingState> {
  try {
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function saveState(state: Partial<OnboardingState>): void {
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore localStorage errors
  }
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { data } = useDashboardContext()
  const [storedState, setStoredState] = useState<Partial<OnboardingState>>(loadStoredState)

  // Compute step completion based on dashboard data
  const stepCompletion = useMemo(() => {
    if (!data) {
      return {
        credentialsConfigured: false,
        firstLeadCreated: false,
        firstRunCompleted: false,
      }
    }

    return {
      credentialsConfigured: (data.credentials?.configuredCount ?? 0) > 0,
      firstLeadCreated: data.leads.total > 0,
      firstRunCompleted: data.automation.recentRuns.some((r) => r.status === 'done'),
    }
  }, [data])

  // Enrich steps with completion status
  const steps = useMemo(() => {
    return ONBOARDING_STEPS.map((step) => ({
      ...step,
      completed: stepCompletion[step.id],
    }))
  }, [stepCompletion])

  const completedCount = steps.filter((s) => s.completed).length
  const totalSteps = steps.length
  const isComplete = completedCount === totalSteps
  const isDismissed = storedState.onboardingDismissed === true

  const state: OnboardingState = {
    hasSeenOnboarding: storedState.hasSeenOnboarding ?? false,
    onboardingDismissed: isDismissed,
    completedAt: storedState.completedAt ?? {},
  }

  const dismissOnboarding = useCallback(() => {
    const newState = { ...storedState, onboardingDismissed: true }
    setStoredState(newState)
    saveState(newState)
  }, [storedState])

  const resetOnboarding = useCallback(() => {
    const newState: Partial<OnboardingState> = {
      hasSeenOnboarding: false,
      onboardingDismissed: false,
      completedAt: {},
    }
    setStoredState(newState)
    saveState(newState)
  }, [])

  const value: OnboardingContextValue = {
    state,
    steps,
    isComplete,
    isDismissed,
    completedCount,
    totalSteps,
    dismissOnboarding,
    resetOnboarding,
  }

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
