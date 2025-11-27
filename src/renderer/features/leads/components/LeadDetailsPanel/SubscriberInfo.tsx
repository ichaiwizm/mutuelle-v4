import { Calendar, Mail, MapPin, Phone, User, Briefcase, Shield } from 'lucide-react'
import { SlideOverSection, SlideOverDataRow } from '@/renderer/components/ui'
import { formatFrenchDate } from '@/renderer/lib/dateUtils'
import type { Subscriber } from '@/shared/types/lead'

interface SubscriberInfoProps {
  subscriber: Subscriber
}

export function SubscriberInfo({ subscriber }: SubscriberInfoProps) {
  return (
    <SlideOverSection title="Subscriber Information">
      <div className="space-y-1 divide-y divide-[var(--color-border)]">
        <SlideOverDataRow
          label={<span className="flex items-center gap-2"><User className="h-3.5 w-3.5" />Full Name</span>}
          value={[subscriber.civilite, subscriber.prenom, subscriber.nom].filter(Boolean).join(' ')}
        />
        <SlideOverDataRow
          label={<span className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />Email</span>}
          value={subscriber.email}
        />
        <SlideOverDataRow
          label={<span className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />Phone</span>}
          value={subscriber.telephone}
        />
        <SlideOverDataRow
          label={<span className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" />Birthday</span>}
          value={formatFrenchDate(subscriber.dateNaissance)}
        />
        <SlideOverDataRow
          label={<span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />Address</span>}
          value={[subscriber.adresse, subscriber.codePostal, subscriber.ville].filter(Boolean).join(', ') || null}
        />
        <SlideOverDataRow
          label={<span className="flex items-center gap-2"><Briefcase className="h-3.5 w-3.5" />Profession</span>}
          value={subscriber.profession}
        />
        <SlideOverDataRow
          label={<span className="flex items-center gap-2"><Shield className="h-3.5 w-3.5" />Social Regime</span>}
          value={subscriber.regimeSocial}
        />
      </div>
    </SlideOverSection>
  )
}
