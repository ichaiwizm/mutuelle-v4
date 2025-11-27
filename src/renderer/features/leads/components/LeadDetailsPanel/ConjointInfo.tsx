import { SlideOverSection, SlideOverDataRow } from '@/renderer/components/ui'
import { formatFrenchDate } from '@/renderer/lib/dateUtils'
import type { Conjoint } from '@/shared/types/lead'

interface ConjointInfoProps {
  conjoint: Conjoint
}

export function ConjointInfo({ conjoint }: ConjointInfoProps) {
  return (
    <SlideOverSection title="Spouse">
      <div className="space-y-1 divide-y divide-[var(--color-border)]">
        <SlideOverDataRow label="Birthday" value={formatFrenchDate(conjoint.dateNaissance)} />
        <SlideOverDataRow label="Profession" value={conjoint.profession} />
        <SlideOverDataRow label="Social Regime" value={conjoint.regimeSocial} />
      </div>
    </SlideOverSection>
  )
}
