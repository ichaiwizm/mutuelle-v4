import { Fragment, type ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '../Button'

export interface SlideOverProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  width?: 'sm' | 'md' | 'lg' | 'xl'
}

const widthClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' }

export function SlideOver({ open, onClose, title, description, children, width = 'md' }: SlideOverProps) {
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <Fragment>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full flex flex-col',
          widthClasses[width],
          'bg-[var(--color-surface)] border-l border-[var(--color-border)]',
          'shadow-2xl animate-slide-in-right'
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between border-b border-[var(--color-border)] px-6 py-4">
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)] font-display">{title}</h2>
              )}
              {description && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="ml-4 -mr-2 -mt-1 h-8 w-8 p-0">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </Fragment>
  )
}
