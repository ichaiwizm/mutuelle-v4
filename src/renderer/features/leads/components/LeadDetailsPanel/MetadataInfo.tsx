import { SlideOverSection, SlideOverDataRow } from '@/renderer/components/ui'
import { formatDate } from '@/renderer/lib/formatters'
import type { LeadWithMeta } from '../../types'

interface MetadataInfoProps {
  lead: LeadWithMeta
}

export function MetadataInfo({ lead }: MetadataInfoProps) {
  return (
    <SlideOverSection title="Metadata">
      <div className="space-y-1 divide-y divide-[var(--color-border)]">
        <SlideOverDataRow label="Lead ID" value={<code className="text-xs">{lead.id}</code>} />
        <SlideOverDataRow label="Created" value={formatDate(lead.createdAt)} />
        <SlideOverDataRow label="Updated" value={formatDate(lead.updatedAt)} />
      </div>
    </SlideOverSection>
  )
}
