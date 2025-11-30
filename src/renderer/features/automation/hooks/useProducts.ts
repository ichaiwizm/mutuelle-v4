import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import type { ProductConfiguration, ProductStatus } from '@/shared/types/product'

interface ProductWithStatus extends ProductConfiguration {
  status: ProductStatus | null
  isActive: boolean
}

interface UseProductsResult {
  products: ProductWithStatus[]
  loading: boolean
  toggling: string | null

  fetchProducts: () => Promise<void>
  toggleProduct: (flowKey: string, activate: boolean) => Promise<void>
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<ProductWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  /**
   * Fetch all products with their status
   */
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const [configs, statuses] = await Promise.all([
        window.api.products.listConfigs(),
        window.api.products.listStatuses(),
      ])

      // Merge configs with statuses
      const productsWithStatus: ProductWithStatus[] = configs.map((config) => {
        const status = statuses.find(
          (s) => s.platform === config.platform && s.product === config.product
        )
        return {
          ...config,
          status: status || null,
          isActive: status?.status === 'active',
        }
      })

      setProducts(productsWithStatus)
    } catch (err) {
      toast.error('Failed to load products')
      console.error('Failed to fetch products:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Toggle product active status
   */
  const toggleProduct = useCallback(async (flowKey: string, activate: boolean) => {
    const product = products.find((p) => p.flowKey === flowKey)
    if (!product) return

    setToggling(flowKey)
    try {
      await window.api.products.updateStatus({
        platform: product.platform,
        product: product.product,
        status: activate ? 'active' : 'inactive',
        updatedBy: 'user',
      })

      toast.success(`${product.displayName} ${activate ? 'activated' : 'deactivated'}`)
      await fetchProducts()
    } catch (err) {
      toast.error(`Failed to ${activate ? 'activate' : 'deactivate'} product`)
      console.error('Failed to toggle product:', err)
    } finally {
      setToggling(null)
    }
  }, [products, fetchProducts])

  // Initial fetch
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    loading,
    toggling,
    fetchProducts,
    toggleProduct,
  }
}
