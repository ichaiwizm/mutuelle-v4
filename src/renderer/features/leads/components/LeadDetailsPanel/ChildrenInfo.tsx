import { Users } from 'lucide-react'
import { SlideOverSection } from '@/renderer/components/ui'
import { formatFrenchDate } from '@/renderer/lib/dateUtils'
import type { Child } from '@/shared/types/lead'

interface ChildrenInfoProps {
  children: Child[]
}

export function ChildrenInfo({ children }: ChildrenInfoProps) {
  if (!children || children.length === 0) return null

  return (
    <SlideOverSection title={`Children (${children.length})`}>
      <div className="space-y-3">
        {children.map((child, index) => (
          <div key={index} className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-[var(--color-text-muted)]" />
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                Child {child.order || index + 1}
              </span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Birthday</span>
                <span className="text-[var(--color-text-primary)]">
                  {formatFrenchDate(child.dateNaissance) || '—'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SlideOverSection>
  )
}
