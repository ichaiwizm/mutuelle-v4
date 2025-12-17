import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { DashboardOverview } from '@/shared/ipc/contracts'

interface DashboardContextValue {
  data: DashboardOverview | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({ children, pollInterval = 30000 }: { children: ReactNode; pollInterval?: number }) {
  const [data, setData] = useState<DashboardOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      // Debug: Check if preload API is available
      if (!window.api) {
        console.error('[DASHBOARD] window.api is undefined - preload script not loaded!')
        throw new Error('API not available - preload script failed to load')
      }
      if (!window.api.dashboard) {
        console.error('[DASHBOARD] window.api.dashboard is undefined')
        throw new Error('Dashboard API not available')
      }
      console.log('[DASHBOARD] Fetching dashboard overview...')
      const result = await window.api.dashboard.overview()
      console.log('[DASHBOARD] Got result:', result ? 'data received' : 'null')
      setData(result)
      setError(null)
    } catch (err) {
      console.error('[DASHBOARD] Error fetching data:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, pollInterval)
    return () => clearInterval(interval)
  }, [fetchData, pollInterval])

  return (
    <DashboardContext.Provider value={{ data, loading, error, refetch: fetchData }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboardContext() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardProvider')
  }
  return context
}
