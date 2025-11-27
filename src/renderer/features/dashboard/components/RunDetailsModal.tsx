import { useEffect, useState } from 'react'
import { Loader2, XCircle } from 'lucide-react'
import { Modal, ModalHeader, StatusBadge } from '@/renderer/components/ui'
import { formatDate } from '@/renderer/lib/formatters'
import { RunItemRow } from './RunItemRow'
import type { Run, RunItem } from '@/shared/types/run'

interface RunDetailsModalProps {
  runId: string | null
  onClose: () => void
}

type RunDetails = Run & { items: RunItem[] }

export function RunDetailsModal({ runId, onClose }: RunDetailsModalProps) {
  const [details, setDetails] = useState<RunDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!runId) { setDetails(null); return }
    const fetchDetails = async () => {
      setLoading(true); setError(null)
      try {
        setDetails(await window.api.automation.get(runId))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load run details')
      } finally { setLoading(false) }
    }
    fetchDetails()
  }, [runId])

  return (
    <Modal isOpen={!!runId} onClose={onClose}>
      <ModalHeader title="Run Details" subtitle={<code>{runId}</code>} onClose={onClose} />
      <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(80vh - 80px)' }}>
        {loading && <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[var(--color-text-muted)]" /></div>}
        {error && <div className="flex flex-col items-center py-12"><XCircle className="h-8 w-8 text-[var(--color-error)] mb-2" /><p className="text-sm text-[var(--color-error)]">{error}</p></div>}
        {details && !loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div><p className="text-xs text-[var(--color-text-muted)] mb-1">Status</p><StatusBadge status={details.status} /></div>
              <div><p className="text-xs text-[var(--color-text-muted)] mb-1">Created</p><p className="text-sm font-medium">{formatDate(details.createdAt)}</p></div>
              <div><p className="text-xs text-[var(--color-text-muted)] mb-1">Items</p><p className="text-sm font-medium">{details.items.length}</p></div>
            </div>
            {details.items.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">Run Items</h3>
                <div className="space-y-2">{details.items.map(item => <RunItemRow key={item.id} item={item} />)}</div>
              </div>
            )}
            {details.items.length === 0 && <div className="text-center py-8 text-[var(--color-text-muted)]"><p className="text-sm">No items in this run</p></div>}
          </div>
        )}
      </div>
    </Modal>
  )
}
