import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'error'
  size?: 'sm' | 'md' | 'lg'
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', size = 'md', leftIcon, rightIcon, error, ...props }, ref) => {
    const hasError = variant === 'error' || !!error

    return (
      <div className="relative">
        {leftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-text-muted)]">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-[var(--radius-md)] border bg-[var(--color-surface)] text-[var(--color-text-primary)]',
            'placeholder:text-[var(--color-text-muted)]',
            'transition-all duration-[var(--transition-fast)]',
            'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[var(--color-background)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            hasError
              ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]/30'
              : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20',
            { sm: 'h-8 px-3 text-sm', md: 'h-9 px-3 text-sm', lg: 'h-10 px-4 text-base' }[size],
            leftIcon && 'pl-9',
            rightIcon && 'pr-9',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--color-text-muted)]">
            {rightIcon}
          </div>
        )}
        {error && <p className="mt-1.5 text-xs text-[var(--color-error)]">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
