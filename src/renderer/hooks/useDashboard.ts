import { useEffect, useState, useCallback } from 'react'
import type { DashboardOverview } from '@/shared/ipc/contracts'

interface UseDashboardResult {
  data: DashboardOverview | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useDashboard(pollInterval = 30000): UseDashboardResult {
  const [data, setData] = useState<DashboardOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const result = await window.api.dashboard.overview()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()

    // Set up polling
    const interval = setInterval(fetchData, pollInterval)

    return () => clearInterval(interval)
  }, [fetchData, pollInterval])

  return { data, loading, error, refetch: fetchData }
}
