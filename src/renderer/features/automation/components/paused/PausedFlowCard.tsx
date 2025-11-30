import { Play, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/renderer/components/ui/Button'
import { Card } from '@/renderer/components/ui/Card'
import { ProgressRing } from '../shared/ProgressRing'
import type { FlowStateDTO } from '@/shared/ipc/contracts'

interface PausedFlowCardProps {
  flow: FlowStateDTO
  isResuming?: boolean
  onResume: () => void
  onDelete: () => void
}

function formatTimeAgo(timestamp: string | Date | number): string {
  const d = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return d.toLocaleDateString('fr-FR')
}

export function PausedFlowCard({ flow, isResuming, onResume, onDelete }: PausedFlowCardProps) {
  // Calculate progress
  const completedStepsCount = flow.completedSteps?.length || 0
  const totalSteps = completedStepsCount + 1 // approximation
  const currentStep = (flow.currentStepIndex || 0) + 1
  const progress = Math.round(((flow.currentStepIndex || 0) / Math.max(totalSteps, 1)) * 100)

  // Format lead ID safely
  const leadIdDisplay = flow.leadId ? `${flow.leadId.slice(0, 12)}...` : 'Unknown'

  // Get paused timestamp
  const pausedTimestamp = flow.pausedAt || flow.startedAt

  return (
    <Card className="p-4 hover:border-[var(--color-border-hover)] transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* Progress Ring */}
        <div className="flex-shrink-0">
          <ProgressRing progress={progress} size="lg" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[var(--color-text-primary)] truncate">
            {flow.flowKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 truncate">
            Lead: {leadIdDisplay}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-[var(--color-text-muted)]">
              Step {currentStep}
            </span>
            {pausedTimestamp && (
              <span className="text-xs text-[var(--color-text-muted)]">
                Paused {formatTimeAgo(pausedTimestamp)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[var(--color-border)]">
        <Button
          variant="primary"
          size="sm"
          onClick={onResume}
          disabled={isResuming}
          className="flex-1"
        >
          {isResuming ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Resuming...
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              Resume
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          disabled={isResuming}
          title="Delete"
          className="text-[var(--color-error)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  )
}
