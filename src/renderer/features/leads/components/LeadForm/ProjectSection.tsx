import { Input, Label, Select } from '@/renderer/components/ui'
import { frenchToISO } from '@/renderer/lib/dateUtils'
import type { Project } from '@/shared/types/lead'
import { MOIS_OPTIONS, FORMULE_OPTIONS, BESOIN_SANTE_OPTIONS } from '../../constants'

interface ProjectSectionProps {
  project: Project
  onUpdate: (field: keyof Project, value: string | boolean | number) => void
}

export function ProjectSection({ project, onUpdate }: ProjectSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        Project Details
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dateEffet">Effective Date</Label>
          <Input
            id="dateEffet"
            type="date"
            value={frenchToISO(project.dateEffet) || ''}
            onChange={(e) => onUpdate('dateEffet', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="moisEcheance">Due Month</Label>
          <Select
            id="moisEcheance"
            options={MOIS_OPTIONS}
            value={project.moisEcheance || ''}
            onChange={(e) => onUpdate('moisEcheance', e.target.value)}
            placeholder="Select month"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="assureurActuel">Current Insurer</Label>
        <Input
          id="assureurActuel"
          value={project.assureurActuel || ''}
          onChange={(e) => onUpdate('assureurActuel', e.target.value)}
          placeholder="Current insurance company"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="formuleChoisie">Chosen Formula</Label>
          <Select
            id="formuleChoisie"
            options={FORMULE_OPTIONS}
            value={project.formuleChoisie || ''}
            onChange={(e) => onUpdate('formuleChoisie', e.target.value)}
            placeholder="Select formula"
          />
        </div>
        <div>
          <Label htmlFor="besoinAssuranceSante">Health Insurance Need</Label>
          <Select
            id="besoinAssuranceSante"
            options={BESOIN_SANTE_OPTIONS}
            value={project.besoinAssuranceSante || ''}
            onChange={(e) => onUpdate('besoinAssuranceSante', e.target.value)}
            placeholder="Select need"
          />
        </div>
      </div>
    </div>
  )
}
