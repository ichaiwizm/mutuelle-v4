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
const FILTERS_STORAGE_KEY = 'automation-filters'

const DEFAULT_FILTERS: RunFilters = {
  status: 'all',
  productKey: 'all',
  search: '',
  dateRange: 'all',
}

/**
 * Load filters from localStorage with fallback to defaults
 */
function loadFiltersFromStorage(): RunFilters {
  try {
    const stored = localStorage.getItem(FILTERS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Validate and merge with defaults to ensure all keys exist
      return {
        ...DEFAULT_FILTERS,
        ...parsed,
        // Don't persist search to avoid confusion on reload
        search: '',
      }
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_FILTERS
}

/**
 * Save filters to localStorage
 */
function saveFiltersToStorage(filters: RunFilters): void {
  try {
    // Don't persist search query
    const toStore = { ...filters, search: '' }
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(toStore))
  } catch {
    // Ignore storage errors
  }
}

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
  })

  // Loading states
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)

  // Filters & pagination - initialize from localStorage
  const [filters, setFiltersState] = useState<RunFilters>(loadFiltersFromStorage)
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

      // Apply client-side filtering (status, search, dateRange)
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

      // Filter by date range
      if (filters.dateRange !== 'all') {
        const now = new Date()
        let cutoffDate: Date

        switch (filters.dateRange) {
          case 'today':
            cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            break
          case '7days':
            cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case '30days':
            cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            break
          default:
            cutoffDate = new Date(0)
        }

        filteredRuns = filteredRuns.filter((r) => {
          const runDate = new Date(r.createdAt)
          return runDate >= cutoffDate
        })
      }

      setRuns(filteredRuns)
      setTotal(result.total)

      // Calculate stats from all runs
      const allRuns = result.runs
      setStats({
        queued: allRuns.filter((r) => r.status === 'queued').length,
        running: allRuns.filter((r) => r.status === 'running').length,
        done: allRuns.filter((r) => r.status === 'done').length,
        failed: allRuns.filter((r) => r.status === 'failed').length,
        cancelled: allRuns.filter((r) => r.status === 'cancelled').length,
      })
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
   * Update filters and persist to localStorage
   */
  const setFilters = useCallback((newFilters: Partial<RunFilters>) => {
    setFiltersState((prev) => {
      const updated = { ...prev, ...newFilters }
      // Persist to localStorage (excluding search)
      saveFiltersToStorage(updated)
      return updated
    })
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
