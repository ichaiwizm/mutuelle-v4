import type { Subscriber } from '@/shared/types/lead'
import { SubscriberIdentityFields } from './SubscriberIdentityFields'
import { SubscriberAddressFields } from './SubscriberAddressFields'

interface SubscriberSectionProps {
  subscriber: Subscriber
  errors: Record<string, string>
  onUpdate: (field: keyof Subscriber, value: string) => void
}

export function SubscriberSection({ subscriber, errors, onUpdate }: SubscriberSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        Subscriber Information
      </h3>
      <SubscriberIdentityFields subscriber={subscriber} errors={errors} onUpdate={onUpdate} />
      <SubscriberAddressFields subscriber={subscriber} onUpdate={onUpdate} />
    </div>
  )
}
