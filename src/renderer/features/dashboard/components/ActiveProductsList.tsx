import { CheckCircle2, Package } from 'lucide-react'
import type { ProductConfiguration } from '@/shared/types/product'

interface ActiveProductsListProps {
  products: ProductConfiguration[]
}

export function ActiveProductsList({ products }: ActiveProductsListProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <Package className="h-6 w-6 text-[var(--color-text-muted)] mb-2" />
        <p className="text-sm text-[var(--color-text-muted)]">No active products</p>
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {products.map(product => (
        <li key={product.flowKey} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />
            <span className="text-sm">{product.displayName}</span>
          </div>
          <span className="text-xs text-[var(--color-text-muted)] capitalize">{product.platform}</span>
        </li>
      ))}
    </ul>
  )
}
