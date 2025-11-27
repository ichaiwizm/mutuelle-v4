import { useLeadForm } from './useLeadForm'
import { SubscriberSection } from './SubscriberSection'
import { ConjointSection } from './ConjointSection'
import { ProjectSection } from './ProjectSection'
import { CoverageSection } from './CoverageSection'
import { ChildrenSection } from './ChildrenSection'
import { FormActions } from './FormActions'
import type { LeadFormProps } from './types'

export function LeadForm({ initialData, onSubmit, onCancel, isSubmitting }: LeadFormProps) {
  const { state, actions, handleSubmit } = useLeadForm({ initialData, onSubmit })
  const { subscriber, project, children, errors, showConjoint } = state

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SubscriberSection subscriber={subscriber} errors={errors} onUpdate={actions.updateSubscriber} />

      <ConjointSection
        project={project}
        showConjoint={showConjoint}
        onToggle={() => actions.setShowConjoint(!showConjoint)}
        onUpdate={actions.updateConjoint}
      />

      <ProjectSection project={project} onUpdate={actions.updateProject} />

      <CoverageSection project={project} onUpdate={actions.updateProject} />

      <ChildrenSection
        children={children}
        onAdd={actions.addChild}
        onRemove={actions.removeChild}
        onUpdate={actions.updateChild}
      />

      <FormActions onCancel={onCancel} isSubmitting={isSubmitting} isEditing={!!initialData} />
    </form>
  )
}
