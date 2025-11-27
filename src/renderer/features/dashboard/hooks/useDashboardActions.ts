import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface UseDashboardActionsProps {
  refetch: () => Promise<void>
}

export function useDashboardActions({ refetch }: UseDashboardActionsProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [cancellingRunId, setCancellingRunId] = useState<string | null>(null)
  const [isResuming, setIsResuming] = useState(false)
  const [viewingRunId, setViewingRunId] = useState<string | null>(null)

  const handleConnect = useCallback(async () => {
    setIsConnecting(true)
    try {
      await window.api.mail.connect()
      toast.success('Gmail connected successfully')
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Connection failed')
    } finally { setIsConnecting(false) }
  }, [refetch])

  const handleDisconnect = useCallback(async () => {
    try {
      await window.api.mail.disconnect()
      toast.success('Gmail disconnected')
      refetch()
    } catch { toast.error('Failed to disconnect') }
  }, [refetch])

  const handleCancelConnect = useCallback(async () => {
    try {
      await window.api.mail.cancelConnect()
      toast.info('Connection cancelled')
    } finally { setIsConnecting(false) }
  }, [])

  const handleFetchEmails = useCallback(async () => {
    setIsFetching(true)
    try {
      toast.loading('Fetching emails...', { id: 'fetch-emails' })
      const result = await window.api.mail.fetch({ days: 30 })
      toast.success(`Fetched ${result.fetched} emails, saved ${result.saved} leads`, { id: 'fetch-emails' })
      refetch()
    } catch { toast.error('Failed to fetch emails', { id: 'fetch-emails' }) }
    finally { setIsFetching(false) }
  }, [refetch])

  const handleCancelFetch = useCallback(async () => {
    try {
      await window.api.mail.cancel()
      toast.dismiss('fetch-emails')
      toast.info('Fetch cancelled')
    } finally { setIsFetching(false) }
  }, [])

  const handleCancelRun = useCallback(async (runId: string) => {
    setCancellingRunId(runId)
    try {
      await window.api.automation.cancel(runId)
      toast.success('Run cancelled')
      refetch()
    } catch { toast.error('Failed to cancel run') }
    finally { setCancellingRunId(null) }
  }, [refetch])

  const handleViewRun = useCallback((runId: string) => setViewingRunId(runId), [])
  const handleCloseModal = useCallback(() => setViewingRunId(null), [])

  const handleResumeAll = useCallback(async () => {
    setIsResuming(true)
    try {
      const pausedFlows = await window.api.flowStates.listPaused()
      let resumed = 0, failed = 0
      for (const flow of pausedFlows) {
        try { await window.api.flowStates.resume(flow.id); resumed++ }
        catch { failed++ }
      }
      toast[failed ? 'warning' : 'success'](`Resumed ${resumed} flows${failed ? `, ${failed} failed` : ''}`)
      refetch()
    } catch { toast.error('Failed to resume flows') }
    finally { setIsResuming(false) }
  }, [refetch])

  return {
    isConnecting, isFetching, cancellingRunId, isResuming, viewingRunId,
    handleConnect, handleDisconnect, handleCancelConnect, handleFetchEmails,
    handleCancelFetch, handleCancelRun, handleViewRun, handleCloseModal, handleResumeAll,
  }
}
