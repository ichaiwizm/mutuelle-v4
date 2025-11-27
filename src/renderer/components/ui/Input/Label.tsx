import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn('text-sm font-medium text-[var(--color-text-secondary)]', className)}
        {...props}
      >
        {children}
        {required && <span className="ml-1 text-[var(--color-error)]">*</span>}
      </label>
    )
  }
)

Label.displayName = 'Label'
