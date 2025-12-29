import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
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
  const location = useLocation()

  const fetchData = useCallback(async () => {
    try {
      if (!window.api) {
        throw new Error('API not available - preload script failed to load')
      }
      if (!window.api.dashboard) {
        throw new Error('Dashboard API not available')
      }
      const result = await window.api.dashboard.overview()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard'))
    } finally {
      setLoading(false)
    }
  }, [])

  // Only poll when on dashboard page
  const isOnDashboard = location.pathname === '/'

  useEffect(() => {
    fetchData()
    if (!isOnDashboard) return // Don't poll when not on dashboard
    const interval = setInterval(fetchData, pollInterval)
    return () => clearInterval(interval)
  }, [fetchData, pollInterval, isOnDashboard])

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
