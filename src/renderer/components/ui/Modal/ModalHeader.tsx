import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from '../Button'

interface ModalHeaderProps {
  title: string
  subtitle?: ReactNode
  onClose: () => void
}

export function ModalHeader({ title, subtitle, onClose }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {subtitle && (
          <div className="text-xs text-[var(--color-text-muted)]">{subtitle}</div>
        )}
      </div>
      <Button variant="ghost" size="sm" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
