import { useState } from 'react'
import { isoToFrench } from '@/renderer/lib/dateUtils'
import type { Lead, Subscriber, Project, Child, Conjoint } from '@/shared/types/lead'
import type { LeadFormProps, LeadFormState, LeadFormActions } from './types'

function generateUUID(): string {
  return crypto.randomUUID()
}

export function useLeadForm({ initialData, onSubmit }: Pick<LeadFormProps, 'initialData' | 'onSubmit'>) {
  const [subscriber, setSubscriber] = useState<Subscriber>(initialData?.subscriber || {})
  const [project, setProject] = useState<Project>(initialData?.project || {})
  const [children, setChildren] = useState<Child[]>(initialData?.children || [])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showConjoint, setShowConjoint] = useState(!!initialData?.project?.conjoint)

  const state: LeadFormState = { subscriber, project, children, errors, showConjoint }

  const updateSubscriber = (field: keyof Subscriber, value: string) => {
    setSubscriber((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const updateProject = (field: keyof Project, value: string | boolean | number) => {
    setProject((prev) => ({ ...prev, [field]: value }))
  }

  const updateConjoint = (field: keyof Conjoint, value: string) => {
    setProject((prev) => ({
      ...prev,
      conjoint: { ...prev.conjoint, [field]: value },
    }))
  }

  const addChild = () => setChildren((prev) => [...prev, {}])
  const removeChild = (index: number) => setChildren((prev) => prev.filter((_, i) => i !== index))
  const updateChild = (index: number, field: keyof Child, value: string) => {
    setChildren((prev) => prev.map((child, i) => (i === index ? { ...child, [field]: value } : child)))
  }

  const actions: LeadFormActions = {
    updateSubscriber,
    updateProject,
    updateConjoint,
    addChild,
    removeChild,
    updateChild,
    setShowConjoint,
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!subscriber.nom?.trim()) newErrors.nom = 'Last name is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const subscriberData = {
      ...subscriber,
      dateNaissance: isoToFrench(subscriber.dateNaissance) || subscriber.dateNaissance,
    }

    const projectData: Project = {
      ...project,
      dateEffet: isoToFrench(project.dateEffet) || project.dateEffet,
    }

    if (showConjoint && projectData.conjoint) {
      projectData.conjoint = {
        ...projectData.conjoint,
        dateNaissance: isoToFrench(projectData.conjoint.dateNaissance) || projectData.conjoint.dateNaissance,
      }
    } else {
      delete projectData.conjoint
    }

    const childrenData = children.map((child) => ({
      ...child,
      dateNaissance: isoToFrench(child.dateNaissance) || child.dateNaissance,
    }))

    const data: Lead = {
      id: initialData?.id ?? generateUUID(),
      subscriber: subscriberData,
      project: Object.keys(projectData).length > 0 ? projectData : undefined,
      children: childrenData.length > 0 ? childrenData : undefined,
    }

    await onSubmit(data)
  }

  return { state, actions, handleSubmit }
}
