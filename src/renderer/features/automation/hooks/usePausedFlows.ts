import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import type { FlowStateDTO } from '@/shared/ipc/contracts'

interface UsePausedFlowsResult {
  pausedFlows: FlowStateDTO[]
  loading: boolean
  resuming: string | null
  resumingAll: boolean

  fetchPausedFlows: () => Promise<void>
  resumeFlow: (id: string) => Promise<void>
  resumeAll: () => Promise<void>
  deleteFlow: (id: string) => Promise<void>
}

export function usePausedFlows(): UsePausedFlowsResult {
  const [pausedFlows, setPausedFlows] = useState<FlowStateDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [resuming, setResuming] = useState<string | null>(null)
  const [resumingAll, setResumingAll] = useState(false)

  /**
   * Fetch all paused flows
   */
  const fetchPausedFlows = useCallback(async () => {
    setLoading(true)
    try {
      const flows = await window.api.flowStates.listPaused()
      setPausedFlows(flows)
    } catch (err) {
      toast.error('Failed to load paused flows')
      console.error('Failed to fetch paused flows:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Resume a single paused flow
   */
  const resumeFlow = useCallback(async (id: string) => {
    setResuming(id)
    try {
      const result = await window.api.flowStates.resume(id)
      if (result.success) {
        toast.success('Flow resumed successfully')
      } else {
        toast.error(result.errorMessage || 'Failed to resume flow')
      }
      await fetchPausedFlows()
    } catch (err) {
      toast.error('Failed to resume flow')
      console.error('Failed to resume flow:', err)
    } finally {
      setResuming(null)
    }
  }, [fetchPausedFlows])

  /**
   * Resume all paused flows in parallel
   */
  const resumeAll = useCallback(async () => {
    if (pausedFlows.length === 0) {
      toast.info('No paused flows to resume')
      return
    }

    setResumingAll(true)
    try {
      const results = await Promise.allSettled(
        pausedFlows.map((flow) => window.api.flowStates.resume(flow.id))
      )

      const succeeded = results.filter((r) => r.status === 'fulfilled').length
      const failed = results.filter((r) => r.status === 'rejected').length

      if (failed > 0) {
        toast.warning(`Resumed ${succeeded} flows, ${failed} failed`)
      } else {
        toast.success(`Resumed ${succeeded} flows`)
      }

      await fetchPausedFlows()
    } catch (err) {
      toast.error('Failed to resume flows')
      console.error('Failed to resume all flows:', err)
    } finally {
      setResumingAll(false)
    }
  }, [pausedFlows, fetchPausedFlows])

  /**
   * Delete a paused flow state
   */
  const deleteFlow = useCallback(async (id: string) => {
    try {
      await window.api.flowStates.delete(id)
      toast.success('Flow state deleted')
      await fetchPausedFlows()
    } catch (err) {
      toast.error('Failed to delete flow state')
      console.error('Failed to delete flow state:', err)
    }
  }, [fetchPausedFlows])

  // Initial fetch
  useEffect(() => {
    fetchPausedFlows()
  }, [fetchPausedFlows])

  return {
    pausedFlows,
    loading,
    resuming,
    resumingAll,
    fetchPausedFlows,
    resumeFlow,
    resumeAll,
    deleteFlow,
  }
}
