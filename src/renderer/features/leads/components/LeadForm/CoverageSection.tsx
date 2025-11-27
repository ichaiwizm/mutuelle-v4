import { Label, Select } from '@/renderer/components/ui'
import type { Project } from '@/shared/types/lead'
import { OUI_NON_OPTIONS, COVERAGE_LEVEL_OPTIONS } from '../../constants'

interface CoverageSectionProps {
  project: Project
  onUpdate: (field: keyof Project, value: string | boolean | number) => void
}

export function CoverageSection({ project, onUpdate }: CoverageSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        Coverage Levels
      </h3>

      <div>
        <Label htmlFor="actuellementAssure">Currently Insured</Label>
        <Select
          id="actuellementAssure"
          options={OUI_NON_OPTIONS}
          value={
            project.actuellementAssure === true
              ? 'Oui'
              : project.actuellementAssure === false
                ? 'Non'
                : ''
          }
          onChange={(e) => onUpdate('actuellementAssure', e.target.value === 'Oui')}
          placeholder="Select"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="soinsMedicaux">Medical Care</Label>
          <Select
            id="soinsMedicaux"
            options={COVERAGE_LEVEL_OPTIONS}
            value={project.soinsMedicaux?.toString() || ''}
            onChange={(e) => onUpdate('soinsMedicaux', parseInt(e.target.value) || 0)}
            placeholder="Select level"
          />
        </div>
        <div>
          <Label htmlFor="hospitalisation">Hospitalization</Label>
          <Select
            id="hospitalisation"
            options={COVERAGE_LEVEL_OPTIONS}
            value={project.hospitalisation?.toString() || ''}
            onChange={(e) => onUpdate('hospitalisation', parseInt(e.target.value) || 0)}
            placeholder="Select level"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="optique">Optical</Label>
          <Select
            id="optique"
            options={COVERAGE_LEVEL_OPTIONS}
            value={project.optique?.toString() || ''}
            onChange={(e) => onUpdate('optique', parseInt(e.target.value) || 0)}
            placeholder="Select level"
          />
        </div>
        <div>
          <Label htmlFor="dentaire">Dental</Label>
          <Select
            id="dentaire"
            options={COVERAGE_LEVEL_OPTIONS}
            value={project.dentaire?.toString() || ''}
            onChange={(e) => onUpdate('dentaire', parseInt(e.target.value) || 0)}
            placeholder="Select level"
          />
        </div>
      </div>
    </div>
  )
}
