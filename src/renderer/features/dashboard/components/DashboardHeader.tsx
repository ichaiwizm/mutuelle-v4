import { Mail, X, Loader2 } from 'lucide-react'
import { Button } from '@/renderer/components/ui'

interface DashboardHeaderProps {
  isFetching: boolean
  isMailConnected: boolean
  onFetchEmails: () => void
  onCancelFetch: () => void
}

export function DashboardHeader({ isFetching, isMailConnected, onFetchEmails, onCancelFetch }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Overview of your automation workflow
        </p>
      </div>
      <div className="flex items-center gap-2">
        {isFetching && (
          <Button variant="ghost" size="sm" onClick={onCancelFetch}>
            <X className="h-4 w-4" />
            Cancel
          </Button>
        )}
        <Button onClick={onFetchEmails} disabled={!isMailConnected || isFetching}>
          {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          {isFetching ? 'Fetching...' : 'Fetch Emails'}
        </Button>
      </div>
    </div>
  )
}
