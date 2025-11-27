import { Skeleton } from '@/renderer/components/ui'
import { LeadsTableSkeleton } from './LeadsTableSkeleton'

export function LeadsLoadingState() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
      <LeadsTableSkeleton rows={8} />
    </div>
  )
}
