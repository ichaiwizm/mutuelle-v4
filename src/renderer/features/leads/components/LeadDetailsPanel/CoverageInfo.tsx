import { Shield, Activity, Heart, Eye, Smile } from 'lucide-react'
import { SlideOverSection, SlideOverDataRow } from '@/renderer/components/ui'
import type { Project } from '@/shared/types/lead'

interface CoverageInfoProps {
  project: Project
}

const formatCoverageLevel = (level?: number) => {
  if (level === undefined || level === null) return null
  const labels: Record<number, string> = {
    1: '1 - Minimum',
    2: '2 - Économique',
    3: '3 - Confort',
    4: '4 - Maximum',
  }
  return labels[level] || level.toString()
}

export function CoverageInfo({ project }: CoverageInfoProps) {
  const hasCoverage =
    project.actuellementAssure !== undefined ||
    project.soinsMedicaux ||
    project.hospitalisation ||
    project.optique ||
    project.dentaire

  if (!hasCoverage) return null

  return (
    <SlideOverSection title="Coverage Levels">
      <div className="space-y-1 divide-y divide-[var(--color-border)]">
        {project.actuellementAssure !== undefined && (
          <SlideOverDataRow
            label={<span className="flex items-center gap-2"><Shield className="h-3.5 w-3.5" />Currently Insured</span>}
            value={project.actuellementAssure ? 'Oui' : 'Non'}
          />
        )}
        {project.soinsMedicaux !== undefined && (
          <SlideOverDataRow
            label={<span className="flex items-center gap-2"><Activity className="h-3.5 w-3.5" />Medical Care</span>}
            value={formatCoverageLevel(project.soinsMedicaux)}
          />
        )}
        {project.hospitalisation !== undefined && (
          <SlideOverDataRow
            label={<span className="flex items-center gap-2"><Heart className="h-3.5 w-3.5" />Hospitalization</span>}
            value={formatCoverageLevel(project.hospitalisation)}
          />
        )}
        {project.optique !== undefined && (
          <SlideOverDataRow
            label={<span className="flex items-center gap-2"><Eye className="h-3.5 w-3.5" />Optical</span>}
            value={formatCoverageLevel(project.optique)}
          />
        )}
        {project.dentaire !== undefined && (
          <SlideOverDataRow
            label={<span className="flex items-center gap-2"><Smile className="h-3.5 w-3.5" />Dental</span>}
            value={formatCoverageLevel(project.dentaire)}
          />
        )}
      </div>
    </SlideOverSection>
  )
}
