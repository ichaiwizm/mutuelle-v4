import { ChevronDown, ChevronUp } from 'lucide-react'
import { Input, Label, Select } from '@/renderer/components/ui'
import { frenchToISO } from '@/renderer/lib/dateUtils'
import type { Project, Conjoint } from '@/shared/types/lead'
import { PROFESSION_OPTIONS, REGIME_SOCIAL_OPTIONS } from '../../constants'

interface ConjointSectionProps {
  project: Project
  showConjoint: boolean
  onToggle: () => void
  onUpdate: (field: keyof Conjoint, value: string) => void
}

export function ConjointSection({ project, showConjoint, onToggle, onUpdate }: ConjointSectionProps) {
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
      >
        <span>Spouse (Conjoint)</span>
        {showConjoint ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {showConjoint && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4 space-y-4">
          <div>
            <Label htmlFor="conjoint-dateNaissance">Birthday</Label>
            <Input
              id="conjoint-dateNaissance"
              type="date"
              value={frenchToISO(project.conjoint?.dateNaissance) || ''}
              onChange={(e) => onUpdate('dateNaissance', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="conjoint-profession">Profession</Label>
              <Select
                id="conjoint-profession"
                options={PROFESSION_OPTIONS}
                value={project.conjoint?.profession || ''}
                onChange={(e) => onUpdate('profession', e.target.value)}
                placeholder="Select profession"
              />
            </div>
            <div>
              <Label htmlFor="conjoint-regimeSocial">Social Regime</Label>
              <Select
                id="conjoint-regimeSocial"
                options={REGIME_SOCIAL_OPTIONS}
                value={project.conjoint?.regimeSocial || ''}
                onChange={(e) => onUpdate('regimeSocial', e.target.value)}
                placeholder="Select regime"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
