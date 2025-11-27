import { SlideOverSection, SlideOverDataRow } from '@/renderer/components/ui'
import { formatFrenchDate } from '@/renderer/lib/dateUtils'
import type { Project } from '@/shared/types/lead'

interface ProjectInfoProps {
  project: Project
}

export function ProjectInfo({ project }: ProjectInfoProps) {
  return (
    <SlideOverSection title="Project Details">
      <div className="space-y-1 divide-y divide-[var(--color-border)]">
        <SlideOverDataRow label="Effective Date" value={formatFrenchDate(project.dateEffet)} />
        <SlideOverDataRow label="Due Month" value={project.moisEcheance} />
        <SlideOverDataRow label="Current Insurer" value={project.assureurActuel} />
        <SlideOverDataRow label="Chosen Formula" value={project.formuleChoisie} />
        <SlideOverDataRow label="Health Insurance Need" value={project.besoinAssuranceSante} />
      </div>
    </SlideOverSection>
  )
}
