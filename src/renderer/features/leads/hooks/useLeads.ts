import { useState, useEffect, useCallback } from 'react'
import { parseLeadRow, type LeadWithMeta, type LeadsListResponse } from '../types'

const PAGE_SIZE = 20

interface UseLeadsOptions {
  initialPage?: number
}

interface UseLeadsReturn {
  leads: LeadWithMeta[]
  total: number
  loading: boolean
  error: Error | null
  page: number
  pageSize: number
  totalPages: number
  setPage: (page: number) => void
  refetch: () => Promise<void>
}

export function useLeads(options: UseLeadsOptions = {}): UseLeadsReturn {
  const { initialPage = 1 } = options

  const [leads, setLeads] = useState<LeadWithMeta[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [page, setPage] = useState(initialPage)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const offset = (page - 1) * PAGE_SIZE

      // Fetch current page - API returns { leads: LeadRow[], total: number }
      const response = await window.api.leads.list({ limit: PAGE_SIZE, offset }) as LeadsListResponse

      const rowsArray = response.leads ?? []
      const count = response.total ?? 0

      const parsedLeads = rowsArray.map(parseLeadRow)
      setLeads(parsedLeads)
      setTotal(count)
    } catch (err) {
      console.error('Failed to fetch leads:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch leads'))
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return {
    leads,
    total,
    loading,
    error,
    page,
    pageSize: PAGE_SIZE,
    totalPages,
    setPage,
    refetch: fetchLeads,
  }
}
