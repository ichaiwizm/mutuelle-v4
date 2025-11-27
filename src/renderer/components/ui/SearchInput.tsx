import { forwardRef, type InputHTMLAttributes } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  value: string
  onValueChange: (value: string) => void
  onClear?: () => void
  size?: 'sm' | 'md' | 'lg'
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onValueChange, onClear, size = 'md', ...props }, ref) => {
    const handleClear = () => {
      onValueChange('')
      onClear?.()
    }

    const sizeClasses = {
      sm: 'h-8 text-sm',
      md: 'h-9 text-sm',
      lg: 'h-10 text-base',
    }

    return (
      <div className={cn('relative', className)}>
        {/* Search icon */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-[var(--color-text-muted)]" />
        </div>

        {/* Input */}
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className={cn(
            'w-full rounded-[var(--radius-md)] border border-[var(--color-border)]',
            'bg-[var(--color-surface)] text-[var(--color-text-primary)]',
            'pl-9 pr-9',
            'placeholder:text-[var(--color-text-muted)]',
            'transition-all duration-[var(--transition-fast)]',
            'hover:border-[var(--color-border-hover)]',
            'focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20',
            sizeClasses[size]
          )}
          {...props}
        />

        {/* Clear button */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'absolute inset-y-0 right-0 flex items-center pr-3',
              'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
              'transition-colors duration-[var(--transition-fast)]'
            )}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </button>
        )}
      </div>
    )
  }
)

SearchInput.displayName = 'SearchInput'
