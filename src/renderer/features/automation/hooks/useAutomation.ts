import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import type { Run } from '@/shared/types/run'
import type { AutomationStats, RunFilters } from '../types'

interface UseAutomationResult {
  // Data
  runs: Run[]
  total: number
  stats: AutomationStats

  // Loading states
  loading: boolean
  cancelling: string | null

  // Filters & pagination
  filters: RunFilters
  currentPage: number
  pageSize: number
  totalPages: number

  // Actions
  fetchRuns: () => Promise<void>
  cancelRun: (runId: string) => Promise<void>
  setFilters: (filters: Partial<RunFilters>) => void
  setCurrentPage: (page: number) => void
}

const DEFAULT_PAGE_SIZE = 20

export function useAutomation(): UseAutomationResult {
  // Data state
  const [runs, setRuns] = useState<Run[]>([])
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState<AutomationStats>({
    queued: 0,
    running: 0,
    done: 0,
    failed: 0,
    cancelled: 0,
    paused: 0,
  })

  // Loading states
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)

  // Filters & pagination
  const [filters, setFiltersState] = useState<RunFilters>({
    status: 'all',
    productKey: 'all',
    search: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = DEFAULT_PAGE_SIZE
  const totalPages = Math.ceil(total / pageSize)

  /**
   * Fetch runs with current filters and pagination
   */
  const fetchRuns = useCallback(async () => {
    setLoading(true)
    try {
      const offset = (currentPage - 1) * pageSize
      const result = await window.api.automation.list({ limit: pageSize, offset })

      // Apply client-side filtering (status, search)
      let filteredRuns = result.runs

      if (filters.status !== 'all') {
        filteredRuns = filteredRuns.filter((r) => r.status === filters.status)
      }

      if (filters.search) {
        const search = filters.search.toLowerCase()
        filteredRuns = filteredRuns.filter(
          (r) => r.id.toLowerCase().includes(search)
        )
      }

      setRuns(filteredRuns)
      setTotal(result.total)

      // Calculate stats from all runs
      const allRuns = result.runs
      const newStats: AutomationStats = {
        queued: allRuns.filter((r) => r.status === 'queued').length,
        running: allRuns.filter((r) => r.status === 'running').length,
        done: allRuns.filter((r) => r.status === 'done').length,
        failed: allRuns.filter((r) => r.status === 'failed').length,
        cancelled: allRuns.filter((r) => r.status === 'cancelled').length,
        paused: 0, // Will be updated separately
      }

      // Get paused count
      try {
        const pausedFlows = await window.api.flowStates.listPaused()
        newStats.paused = pausedFlows.length
      } catch {
        // Ignore error for paused count
      }

      setStats(newStats)
    } catch (err) {
      toast.error('Failed to load automation runs')
      console.error('Failed to fetch runs:', err)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, filters])

  /**
   * Cancel a running automation
   */
  const cancelRun = useCallback(async (runId: string) => {
    setCancelling(runId)
    try {
      await window.api.automation.cancel(runId)
      toast.success('Run cancelled')
      await fetchRuns()
    } catch (err) {
      toast.error('Failed to cancel run')
      console.error('Failed to cancel run:', err)
    } finally {
      setCancelling(null)
    }
  }, [fetchRuns])

  /**
   * Update filters
   */
  const setFilters = useCallback((newFilters: Partial<RunFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }))
    setCurrentPage(1) // Reset to first page when filters change
  }, [])

  // Initial fetch and refetch when page/filters change
  useEffect(() => {
    fetchRuns()
  }, [fetchRuns])

  return {
    runs,
    total,
    stats,
    loading,
    cancelling,
    filters,
    currentPage,
    pageSize,
    totalPages,
    fetchRuns,
    cancelRun,
    setFilters,
    setCurrentPage,
  }
}
