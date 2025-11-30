import { Package, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/renderer/components/ui/Button'
import { Skeleton } from '@/renderer/components/ui/Skeleton'
import { EmptyState } from '@/renderer/components/ui/EmptyState'
import { ProductCard } from './ProductCard'
import type { ProductConfiguration } from '@/shared/types/product'

interface ProductWithStatus extends ProductConfiguration {
  isActive: boolean
}

interface ProductsTabProps {
  products: ProductWithStatus[]
  loading?: boolean
  toggling?: string | null
  onToggle: (flowKey: string, activate: boolean) => void
}

export function ProductsTab({ products, loading, toggling, onToggle }: ProductsTabProps) {
  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 rounded-lg border border-[var(--color-border)]">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-64" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="p-8">
        <EmptyState
          icon={<Package className="h-8 w-8" />}
          title="No products configured"
          description="Products will appear here once they are configured in the system."
        />
      </div>
    )
  }

  const activeProducts = products.filter((p) => p.isActive)
  const inactiveProducts = products.filter((p) => !p.isActive)

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[var(--color-text-muted)]">
          {activeProducts.length} of {products.length} products active
        </p>
        <Link to="/config">
          <Button variant="ghost" size="sm">
            <Settings className="h-3.5 w-3.5" />
            Advanced Settings
          </Button>
        </Link>
      </div>

      {/* Active Products */}
      {activeProducts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">
            Active Products
          </h3>
          <div className="space-y-3">
            {activeProducts.map((product, index) => (
              <div
                key={product.flowKey}
                className="animate-fade-in"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'backwards',
                }}
              >
                <ProductCard
                  product={product}
                  isToggling={toggling === product.flowKey}
                  onToggle={(activate) => onToggle(product.flowKey, activate)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inactive Products */}
      {inactiveProducts.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[var(--color-text-muted)] mb-3">
            Inactive Products
          </h3>
          <div className="space-y-3">
            {inactiveProducts.map((product, index) => (
              <div
                key={product.flowKey}
                className="animate-fade-in opacity-60 hover:opacity-100 transition-opacity"
                style={{
                  animationDelay: `${(activeProducts.length + index) * 50}ms`,
                  animationFillMode: 'backwards',
                }}
              >
                <ProductCard
                  product={product}
                  isToggling={toggling === product.flowKey}
                  onToggle={(activate) => onToggle(product.flowKey, activate)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
