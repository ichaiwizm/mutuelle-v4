import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { SlideOver } from '@/renderer/components/ui/SlideOver'
import { Button } from '@/renderer/components/ui/Button'
import { Skeleton } from '@/renderer/components/ui/Skeleton'
import { Folder, XCircle, RefreshCw, Loader2 } from 'lucide-react'
import { Timeline, TimelineItem } from '../shared/Timeline'
import { StatusIndicator } from '../shared/StatusIndicator'
import type { Run, RunItem } from '@/shared/types/run'

interface RunDetails {
  id: string
  status: Run['status']
  createdAt: Date | string
  items: RunItem[]
}

interface RunDetailsSlideOverProps {
  runId: string | null
  onClose: () => void
  onCancel?: (runId: string) => void
}

function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getTimelineStatus(status: string): 'completed' | 'failed' | 'running' | 'pending' | 'paused' {
  switch (status) {
    case 'done':
    case 'completed':
      return 'completed'
    case 'failed':
    case 'error':
      return 'failed'
    case 'running':
      return 'running'
    case 'paused':
      return 'paused'
    default:
      return 'pending'
  }
}

export function RunDetailsSlideOver({ runId, onClose, onCancel }: RunDetailsSlideOverProps) {
  const navigate = useNavigate()
  const [details, setDetails] = useState<RunDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryingItem, setRetryingItem] = useState<string | null>(null)

  const handleRetryItem = useCallback(async (itemId: string) => {
    setRetryingItem(itemId)
    try {
      const result = await window.api.automation.retryItem(itemId)
      toast.success('Flow relancé', {
        description: `Nouvelle exécution créée`,
        action: {
          label: 'Voir',
          onClick: () => navigate(`/automation?run=${result.newRunId}`),
        },
      })
      onClose()
    } catch (err) {
      console.error('Failed to retry item:', err)
      toast.error('Échec de la relance')
    } finally {
      setRetryingItem(null)
    }
  }, [navigate, onClose])

  useEffect(() => {
    if (!runId) {
      setDetails(null)
      return
    }

    const fetchDetails = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await window.api.automation.get(runId)
        if (result) {
          setDetails({
            id: result.id,
            status: result.status,
            createdAt: result.createdAt,
            items: result.items || [],
          })
        } else {
          setError('Run not found')
        }
      } catch (err) {
        setError('Failed to load run details')
        console.error('Failed to fetch run details:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [runId])

  const canCancel = details?.status === 'running' || details?.status === 'queued'

  return (
    <SlideOver
      open={!!runId}
      onClose={onClose}
      title="Run Details"
      description={runId ? `Run ID: ${runId}` : undefined}
      width="lg"
    >
      {loading ? (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-4 w-48" />
          <div className="space-y-4 mt-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="p-4 text-center">
          <p className="text-[var(--color-error)]">{error}</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={() => runId && setLoading(true)}>
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : details ? (
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3">
                <StatusIndicator status={details.status as any} showLabel size="lg" />
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-2">
                Created: {formatDate(details.createdAt)}
              </p>
            </div>
            {canCancel && onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCancel(details.id)}
                className="text-[var(--color-error)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>

          {/* Items Timeline */}
          <div className="border-t border-[var(--color-border)] pt-4">
            <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-4">
              Items ({details.items.length})
            </h3>

            {details.items.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">No items in this run.</p>
            ) : (
              <Timeline>
                {details.items.map((item, index) => (
                  <TimelineItem
                    key={item.id}
                    title={item.flowKey.replace(/_/g, ' ')}
                    description={item.leadName || "Lead inconnu"}
                    status={getTimelineStatus(item.status)}
                    isLast={index === details.items.length - 1}
                    action={
                      (item.status === 'failed' || item.status === 'cancelled') ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRetryItem(item.id)}
                          disabled={retryingItem === item.id}
                          className="h-6 w-6 p-0"
                        >
                          {retryingItem === item.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3 w-3" />
                          )}
                        </Button>
                      ) : undefined
                    }
                  />
                ))}
              </Timeline>
            )}
          </div>

          {/* Artifacts section */}
          {details.items.some((item) => item.artifactsDir) && (
            <div className="border-t border-[var(--color-border)] pt-4 mt-4">
              <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">
                Artifacts
              </h3>
              <div className="space-y-2">
                {details.items
                  .filter((item) => item.artifactsDir)
                  .map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        window.api.shell.openPath(item.artifactsDir!).catch(console.error)
                      }}
                      className="w-full justify-start"
                    >
                      <Folder className="h-4 w-4" />
                      {item.flowKey} - {item.leadName || "Lead inconnu"}
                    </Button>
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </SlideOver>
  )
}
