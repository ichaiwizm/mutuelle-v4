import { type ReactNode } from 'react'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  content: string
  children: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

const sideStyles = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

const arrowStyles = {
  top: 'top-full left-1/2 -translate-x-1/2 -mt-1 border-t-[var(--color-surface-elevated)] border-x-transparent border-b-transparent',
  bottom:
    'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-[var(--color-surface-elevated)] border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 -ml-1 border-l-[var(--color-surface-elevated)] border-y-transparent border-r-transparent',
  right:
    'right-full top-1/2 -translate-y-1/2 -mr-1 border-r-[var(--color-surface-elevated)] border-y-transparent border-l-transparent',
}

export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  return (
    <div className={cn('relative inline-flex group', className)}>
      {children}
      <div
        className={cn(
          'absolute z-50 px-3 py-2 text-xs rounded-lg',
          'bg-[var(--color-surface-elevated)] border border-[var(--color-border)]',
          'text-[var(--color-text-secondary)] max-w-xs whitespace-normal',
          'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
          'transition-all duration-150 pointer-events-none',
          'shadow-lg',
          sideStyles[side]
        )}
      >
        {content}
        <div className={cn('absolute w-0 h-0 border-4', arrowStyles[side])} />
      </div>
    </div>
  )
}

interface InfoTooltipProps {
  content: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function InfoTooltip({ content, side = 'top', className }: InfoTooltipProps) {
  return (
    <Tooltip content={content} side={side} className={className}>
      <Info className="h-3.5 w-3.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] cursor-help transition-colors" />
    </Tooltip>
  )
}
