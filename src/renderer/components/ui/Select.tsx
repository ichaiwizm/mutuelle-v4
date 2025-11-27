import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[]
  variant?: 'default' | 'error'
  size?: 'sm' | 'md' | 'lg'
  error?: string
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, variant = 'default', size = 'md', error, placeholder, ...props }, ref) => {
    const hasError = variant === 'error' || !!error

    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            // Base styles
            'w-full appearance-none rounded-[var(--radius-md)] border bg-[var(--color-surface)] text-[var(--color-text-primary)]',
            'transition-all duration-[var(--transition-fast)]',
            'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[var(--color-background)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'cursor-pointer',

            // Variant styles
            hasError
              ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]/30'
              : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20',

            // Size styles
            {
              sm: 'h-8 px-3 pr-8 text-sm',
              md: 'h-9 px-3 pr-8 text-sm',
              lg: 'h-10 px-4 pr-10 text-base',
            }[size],

            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-[var(--color-text-muted)]">
          <ChevronDown className={cn('h-4 w-4', size === 'lg' && 'h-5 w-5')} />
        </div>
        {error && <p className="mt-1.5 text-xs text-[var(--color-error)]">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
