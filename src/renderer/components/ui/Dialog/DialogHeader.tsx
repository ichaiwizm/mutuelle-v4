import { X } from 'lucide-react'
import { Button } from '../Button'

interface DialogHeaderProps {
  title: string
  onClose: () => void
  disabled?: boolean
}

export function DialogHeader({ title, onClose, disabled }: DialogHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] font-display">{title}</h2>
      <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0" disabled={disabled}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
