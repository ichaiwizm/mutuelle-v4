import { Input, Label, Select } from '@/renderer/components/ui'
import type { Subscriber } from '@/shared/types/lead'
import { PROFESSION_OPTIONS, REGIME_SOCIAL_OPTIONS } from '../../constants'

interface Props {
  subscriber: Subscriber
  onUpdate: (field: keyof Subscriber, value: string) => void
}

export function SubscriberAddressFields({ subscriber, onUpdate }: Props) {
  return (
    <>
      <div>
        <Label htmlFor="adresse">Address</Label>
        <Input id="adresse" value={subscriber.adresse || ''} onChange={(e) => onUpdate('adresse', e.target.value)} placeholder="123 Main Street" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="codePostal">Postal Code</Label>
          <Input id="codePostal" value={subscriber.codePostal || ''} onChange={(e) => onUpdate('codePostal', e.target.value)} placeholder="75001" />
        </div>
        <div>
          <Label htmlFor="ville">City</Label>
          <Input id="ville" value={subscriber.ville || ''} onChange={(e) => onUpdate('ville', e.target.value)} placeholder="Paris" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="profession">Profession</Label>
          <Select id="profession" options={PROFESSION_OPTIONS} value={subscriber.profession || ''} onChange={(e) => onUpdate('profession', e.target.value)} placeholder="Select profession" />
        </div>
        <div>
          <Label htmlFor="regimeSocial">Social Regime</Label>
          <Select id="regimeSocial" options={REGIME_SOCIAL_OPTIONS} value={subscriber.regimeSocial || ''} onChange={(e) => onUpdate('regimeSocial', e.target.value)} placeholder="Select regime" />
        </div>
      </div>
    </>
  )
}
