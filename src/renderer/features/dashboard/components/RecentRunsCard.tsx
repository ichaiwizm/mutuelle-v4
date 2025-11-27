import { Button, Card, CardHeader, CardTitle, CardContent } from '@/renderer/components/ui'
import { RecentRunsTable } from './RecentRunsTable'
import type { Run } from '@/shared/types/run'

interface RecentRunsCardProps {
  runs: Run[]
  cancellingRunId: string | null
  onCancel: (runId: string) => void
  onView: (runId: string) => void
}

export function RecentRunsCard({ runs, cancellingRunId, onCancel, onView }: RecentRunsCardProps) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Recent Runs</CardTitle>
        <Button variant="ghost" size="sm">View All</Button>
      </CardHeader>
      <CardContent className="p-0">
        <RecentRunsTable
          runs={runs}
          cancellingRunId={cancellingRunId}
          onCancel={onCancel}
          onView={onView}
        />
      </CardContent>
    </Card>
  )
}
