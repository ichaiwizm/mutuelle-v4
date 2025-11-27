import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'error'
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = 'default', error, ...props }, ref) => {
    const hasError = variant === 'error' || !!error

    return (
      <div>
        <textarea
          ref={ref}
          className={cn(
            'w-full rounded-[var(--radius-md)] border bg-[var(--color-surface)] text-[var(--color-text-primary)]',
            'placeholder:text-[var(--color-text-muted)]',
            'transition-all duration-[var(--transition-fast)]',
            'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[var(--color-background)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'min-h-[80px] px-3 py-2 text-sm',
            hasError
              ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]/30'
              : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-[var(--color-error)]">{error}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
