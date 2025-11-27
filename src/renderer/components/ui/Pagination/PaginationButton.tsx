import type { ReactNode } from 'react'
import { Button } from '../Button'

interface PaginationButtonProps {
  onClick: () => void
  disabled?: boolean
  children: ReactNode
  srLabel?: string
}

export function PaginationButton({ onClick, disabled, children, srLabel }: PaginationButtonProps) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} disabled={disabled} className="h-8 w-8 p-0">
      {children}
      {srLabel && <span className="sr-only">{srLabel}</span>}
    </Button>
  )
}
