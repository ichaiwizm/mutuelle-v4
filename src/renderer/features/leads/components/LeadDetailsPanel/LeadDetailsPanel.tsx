import { SlideOver, Button } from '@/renderer/components/ui'
import type { LeadWithMeta } from '../../types'
import { SubscriberInfo } from './SubscriberInfo'
import { ProjectInfo } from './ProjectInfo'
import { CoverageInfo } from './CoverageInfo'
import { ConjointInfo } from './ConjointInfo'
import { ChildrenInfo } from './ChildrenInfo'
import { MetadataInfo } from './MetadataInfo'

interface LeadDetailsPanelProps {
  lead: LeadWithMeta | null
  open: boolean
  onClose: () => void
  onEdit: (lead: LeadWithMeta) => void
}

export function LeadDetailsPanel({ lead, open, onClose, onEdit }: LeadDetailsPanelProps) {
  if (!lead) return null

  const { subscriber, project, children } = lead

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title={[subscriber.prenom, subscriber.nom].filter(Boolean).join(' ') || 'Lead Details'}
      description={subscriber.email}
      width="lg"
    >
      <div className="mb-6 flex gap-2">
        <Button variant="primary" onClick={() => onEdit(lead)} className="flex-1">
          Edit Lead
        </Button>
      </div>

      <SubscriberInfo subscriber={subscriber} />
      {project && <ProjectInfo project={project} />}
      {project && <CoverageInfo project={project} />}
      {project?.conjoint && <ConjointInfo conjoint={project.conjoint} />}
      {children && <ChildrenInfo children={children} />}
      <MetadataInfo lead={lead} />
    </SlideOver>
  )
}
