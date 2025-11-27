import { Input, Label, Select } from '@/renderer/components/ui'
import { frenchToISO } from '@/renderer/lib/dateUtils'
import type { Subscriber } from '@/shared/types/lead'
import { CIVILITE_OPTIONS } from '../../constants'

interface Props {
  subscriber: Subscriber
  errors: Record<string, string>
  onUpdate: (field: keyof Subscriber, value: string) => void
}

export function SubscriberIdentityFields({ subscriber, errors, onUpdate }: Props) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="civilite">Title</Label>
          <Select
            id="civilite"
            options={CIVILITE_OPTIONS}
            value={subscriber.civilite || ''}
            onChange={(e) => onUpdate('civilite', e.target.value)}
            placeholder="Select title"
          />
        </div>
        <div />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="prenom">First Name</Label>
          <Input
            id="prenom"
            value={subscriber.prenom || ''}
            onChange={(e) => onUpdate('prenom', e.target.value)}
            placeholder="John"
          />
        </div>
        <div>
          <Label htmlFor="nom" required>Last Name</Label>
          <Input
            id="nom"
            value={subscriber.nom || ''}
            onChange={(e) => onUpdate('nom', e.target.value)}
            placeholder="Doe"
            variant={errors.nom ? 'error' : 'default'}
            error={errors.nom}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={subscriber.email || ''} onChange={(e) => onUpdate('email', e.target.value)} placeholder="john@example.com" />
        </div>
        <div>
          <Label htmlFor="telephone">Phone</Label>
          <Input id="telephone" type="tel" value={subscriber.telephone || ''} onChange={(e) => onUpdate('telephone', e.target.value)} placeholder="06.12.34.56.78" />
        </div>
      </div>

      <div>
        <Label htmlFor="dateNaissance">Birthday</Label>
        <Input id="dateNaissance" type="date" value={frenchToISO(subscriber.dateNaissance) || ''} onChange={(e) => onUpdate('dateNaissance', e.target.value)} />
      </div>
    </>
  )
}
