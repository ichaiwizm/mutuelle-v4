import type { Lead, Subscriber, Project, Child, Conjoint } from '@/shared/types/lead'

export interface LeadFormProps {
  initialData?: Lead
  onSubmit: (data: Lead) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export interface LeadFormState {
  subscriber: Subscriber
  project: Project
  children: Child[]
  errors: Record<string, string>
  showConjoint: boolean
}

export interface LeadFormActions {
  updateSubscriber: (field: keyof Subscriber, value: string) => void
  updateProject: (field: keyof Project, value: string | boolean | number) => void
  updateConjoint: (field: keyof Conjoint, value: string) => void
  addChild: () => void
  removeChild: (index: number) => void
  updateChild: (index: number, field: keyof Child, value: string) => void
  setShowConjoint: (show: boolean) => void
}
