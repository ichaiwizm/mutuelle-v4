import { cn } from '@/lib/utils'
import { Check, X, Loader2, Clock, Zap, Package } from 'lucide-react'
import { Card } from '@/renderer/components/ui/Card'
import type { ProductConfiguration } from '@/shared/types/product'

interface ProductCardProps {
  product: ProductConfiguration & { isActive: boolean }
  isToggling?: boolean
  onToggle: (activate: boolean) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  sante: 'bg-green-400/20 text-green-400',
  prevoyance: 'bg-blue-400/20 text-blue-400',
  retraite: 'bg-amber-400/20 text-amber-400',
  vie: 'bg-purple-400/20 text-purple-400',
}

export function ProductCard({ product, isToggling, onToggle }: ProductCardProps) {
  const categoryColor = CATEGORY_COLORS[product.category] || 'bg-zinc-400/20 text-zinc-400'
  const stepsCount = product.steps?.length || 0
  const estimatedDuration = product.metadata?.estimatedTotalDuration
    ? `~${Math.round(product.metadata.estimatedTotalDuration / 1000)}s`
    : null

  return (
    <Card
      className={cn(
        'p-4 transition-all',
        product.isActive
          ? 'border-[var(--color-primary)]/50 bg-[var(--color-primary)]/5'
          : 'border-[var(--color-border)]'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-[var(--color-text-primary)] truncate">
              {product.displayName}
            </h3>
            <span className={cn('text-xs px-2 py-0.5 rounded-full', categoryColor)}>
              {product.category}
            </span>
          </div>
          {product.description && (
            <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2">
              {product.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
              <Zap className="h-3 w-3" />
              {stepsCount} steps
            </span>
            {estimatedDuration && (
              <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                <Clock className="h-3 w-3" />
                {estimatedDuration}
              </span>
            )}
            <span className="text-xs text-[var(--color-text-muted)]">
              {product.platform}
            </span>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          role="switch"
          aria-checked={product.isActive}
          onClick={() => onToggle(!product.isActive)}
          disabled={isToggling}
          className={cn(
            'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent',
            'transition-colors duration-200 ease-in-out',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-background)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            product.isActive ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
          )}
        >
          <span
            className={cn(
              'inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow',
              'transition duration-200 ease-in-out',
              product.isActive ? 'translate-x-5' : 'translate-x-0'
            )}
          >
            {isToggling ? (
              <Loader2 className="h-3 w-3 animate-spin text-[var(--color-text-muted)]" />
            ) : product.isActive ? (
              <Check className="h-3 w-3 text-[var(--color-primary)]" />
            ) : (
              <X className="h-3 w-3 text-[var(--color-text-muted)]" />
            )}
          </span>
        </button>
      </div>
    </Card>
  )
}
