import { toast } from 'sonner'
import {
  Users,
  Zap,
  PauseCircle,
  Mail,
  RefreshCw,
  Square,
  Eye,
  CheckCircle2,
  Package,
} from 'lucide-react'
import { useDashboard } from '@/renderer/hooks/useDashboard'
import { Button, Card, CardHeader, CardTitle, CardContent, StatCard, StatusBadge } from '@/renderer/components/ui'
import type { Run } from '@/shared/types/run'
import type { ProductConfiguration } from '@/shared/types/product'

function formatTimeAgo(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

interface RecentRunsTableProps {
  runs: Run[]
  onCancel: (runId: string) => void
}

function RecentRunsTable({ runs, onCancel }: RecentRunsTableProps) {
  if (runs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Zap className="h-8 w-8 text-[var(--color-text-muted)] mb-2" />
        <p className="text-sm text-[var(--color-text-muted)]">No recent runs</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-[var(--color-border)]">
      {runs.map((run) => (
        <div
          key={run.id}
          className="flex items-center justify-between px-4 py-3 hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          <div className="flex items-center gap-4">
            <code className="text-xs font-mono text-[var(--color-text-muted)]">
              {run.id.slice(0, 12)}
            </code>
            <StatusBadge status={run.status} />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--color-text-muted)]">
              {formatTimeAgo(run.createdAt)}
            </span>
            {run.status === 'running' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCancel(run.id)}
              >
                <Square className="h-3.5 w-3.5" />
                Stop
              </Button>
            )}
            {run.status === 'queued' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCancel(run.id)}
              >
                <Square className="h-3.5 w-3.5" />
                Cancel
              </Button>
            )}
            {(run.status === 'done' || run.status === 'failed' || run.status === 'cancelled') && (
              <Button variant="ghost" size="sm">
                <Eye className="h-3.5 w-3.5" />
                View
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

interface ActiveProductsListProps {
  products: ProductConfiguration[]
}

function ActiveProductsList({ products }: ActiveProductsListProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <Package className="h-6 w-6 text-[var(--color-text-muted)] mb-2" />
        <p className="text-sm text-[var(--color-text-muted)]">No active products</p>
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {products.map((product) => (
        <li
          key={product.flowKey}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />
            <span className="text-sm">{product.displayName}</span>
          </div>
          <span className="text-xs text-[var(--color-text-muted)] capitalize">
            {product.platform}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function DashboardPage() {
  const { data, loading, error, refetch } = useDashboard()

  const handleFetchEmails = async () => {
    try {
      toast.loading('Fetching emails...', { id: 'fetch-emails' })
      const result = await window.api.mail.fetch({ days: 7 })
      toast.success(`Fetched ${result.fetched} emails, found ${result.detected} leads`, {
        id: 'fetch-emails',
      })
      refetch()
    } catch (err) {
      toast.error('Failed to fetch emails', { id: 'fetch-emails' })
    }
  }

  const handleCancelRun = async (runId: string) => {
    try {
      await window.api.automation.cancel(runId)
      toast.success('Run cancelled')
      refetch()
    } catch (err) {
      toast.error('Failed to cancel run')
    }
  }

  
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-[var(--color-text-muted)]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-[var(--color-error)]">Failed to load dashboard</p>
        <Button onClick={refetch}>Retry</Button>
      </div>
    )
  }

  if (!data) return null

  const runningCount = data.automation.recentRuns.filter(
    (r) => r.status === 'running'
  ).length
  const doneCount = data.automation.recentRuns.filter(
    (r) => r.status === 'done'
  ).length

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Overview of your automation workflow
          </p>
        </div>
        <Button onClick={handleFetchEmails} disabled={!data.mail.ok}>
          <Mail className="h-4 w-4" />
          Fetch Emails
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="Total Leads"
          value={data.leads.total}
          icon={Users}
        />
        <StatCard
          title="Total Runs"
          value={data.automation.totalRuns}
          icon={Zap}
          subtitle={`${runningCount} running, ${doneCount} done`}
        />
        <StatCard
          title="Paused Flows"
          value={data.flowStates.pausedCount}
          icon={PauseCircle}
          action={
            data.flowStates.pausedCount > 0 && (
              <Button variant="ghost" size="sm">
                Resume All
              </Button>
            )
          }
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Recent Runs - 2 columns */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Runs</CardTitle>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <RecentRunsTable
              runs={data.automation.recentRuns}
              onCancel={handleCancelRun}
            />
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Gmail Status */}
          <Card>
            <CardHeader>
              <CardTitle>Gmail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    data.mail.ok
                      ? 'bg-[var(--color-success-muted)]'
                      : 'bg-[var(--color-surface-hover)]'
                  }`}
                >
                  <Mail
                    className={`h-5 w-5 ${
                      data.mail.ok
                        ? 'text-[var(--color-success)]'
                        : 'text-[var(--color-text-muted)]'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  {data.mail.ok ? (
                    <>
                      <p className="text-sm font-medium">{data.mail.email}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Connected
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium">Not connected</p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Connect to fetch leads
                      </p>
                    </>
                  )}
                </div>
                <Button
                  variant={data.mail.ok ? 'ghost' : 'primary'}
                  size="sm"
                  onClick={async () => {
                    if (data.mail.ok) {
                      await window.api.mail.disconnect()
                      refetch()
                    } else {
                      await window.api.mail.connect()
                      refetch()
                    }
                  }}
                >
                  {data.mail.ok ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Products */}
          <Card>
            <CardHeader>
              <CardTitle>Active Products ({data.products.activeCount})</CardTitle>
            </CardHeader>
            <CardContent>
              <ActiveProductsList products={data.products.active} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
