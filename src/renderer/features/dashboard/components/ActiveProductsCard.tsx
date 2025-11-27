import { Card, CardHeader, CardTitle, CardContent } from '@/renderer/components/ui'
import { ActiveProductsList } from './ActiveProductsList'
import type { ProductConfiguration } from '@/shared/types/product'

interface ActiveProductsCardProps {
  products: ProductConfiguration[]
  activeCount: number
}

export function ActiveProductsCard({ products, activeCount }: ActiveProductsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Products ({activeCount})</CardTitle>
      </CardHeader>
      <CardContent>
        <ActiveProductsList products={products} />
      </CardContent>
    </Card>
  )
}
