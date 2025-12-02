import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface UseDashboardActionsProps {
  refetch: () => Promise<void>
}

export function useDashboardActions({ refetch }: UseDashboardActionsProps) {
  const [isFetching, setIsFetching] = useState(false)
  const [cancellingRunId, setCancellingRunId] = useState<string | null>(null)
  const [viewingRunId, setViewingRunId] = useState<string | null>(null)

  const handleFetchEmails = useCallback(async () => {
    setIsFetching(true)
    try {
      toast.loading('Fetching emails...', { id: 'fetch-emails' })
      const result = await window.api.mail.fetch({ days: 30 })
      const dupMsg = result.duplicates ? `, ${result.duplicates} duplicates ignored` : ''
      toast.success(`Fetched ${result.fetched} emails, saved ${result.saved} leads${dupMsg}`, {
        id: 'fetch-emails',
      })
      refetch()
    } catch {
      toast.error('Failed to fetch emails', { id: 'fetch-emails' })
    } finally {
      setIsFetching(false)
    }
  }, [refetch])

  const handleCancelFetch = useCallback(async () => {
    try {
      await window.api.mail.cancel()
      toast.dismiss('fetch-emails')
      toast.info('Fetch cancelled')
    } finally {
      setIsFetching(false)
    }
  }, [])

  const handleCancelRun = useCallback(
    async (runId: string) => {
      setCancellingRunId(runId)
      try {
        await window.api.automation.cancel(runId)
        toast.success('Run cancelled')
        refetch()
      } catch {
        toast.error('Failed to cancel run')
      } finally {
        setCancellingRunId(null)
      }
    },
    [refetch]
  )

  const handleViewRun = useCallback((runId: string) => setViewingRunId(runId), [])
  const handleCloseModal = useCallback(() => setViewingRunId(null), [])

  return {
    isFetching,
    cancellingRunId,
    viewingRunId,
    handleFetchEmails,
    handleCancelFetch,
    handleCancelRun,
    handleViewRun,
    handleCloseModal,
  }
}
