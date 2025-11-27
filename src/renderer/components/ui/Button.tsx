import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-medium transition-all duration-[var(--transition-fast)]',
          'rounded-[var(--radius-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]',
          'disabled:pointer-events-none disabled:opacity-50',

          // Variants
          {
            // Primary - filled purple
            primary:
              'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] active:scale-[0.98]',

            // Secondary - outlined
            secondary:
              'border border-[var(--color-border)] bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-hover)]',

            // Ghost - no border
            ghost:
              'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]',

            // Danger - red
            danger:
              'bg-[var(--color-error)] text-white hover:bg-[var(--color-error)]/90 active:scale-[0.98]',
          }[variant],

          // Sizes
          {
            sm: 'h-8 px-3 text-sm gap-1.5',
            md: 'h-9 px-4 text-sm gap-2',
            lg: 'h-10 px-5 text-base gap-2',
          }[size],

          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
