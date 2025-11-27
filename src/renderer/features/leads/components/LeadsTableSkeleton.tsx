import { Table, TableHeader, TableBody, TableHead, Skeleton } from '@/renderer/components/ui'

interface LeadsTableSkeletonProps {
  rows?: number
}

export function LeadsTableSkeleton({ rows = 5 }: LeadsTableSkeletonProps) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden animate-fade-in">
      <Table>
        <TableHeader>
          <tr>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="w-[200px]">Email</TableHead>
            <TableHead className="w-[140px]">Phone</TableHead>
            <TableHead className="w-[120px]">City</TableHead>
            <TableHead className="w-[100px]">Created</TableHead>
            <TableHead className="w-[120px]">Actions</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, index) => (
            <tr
              key={index}
              className="border-b border-[var(--color-border)]"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <td className="px-4 py-3">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-40" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-28" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8 rounded-[var(--radius-md)]" />
                  <Skeleton className="h-8 w-8 rounded-[var(--radius-md)]" />
                  <Skeleton className="h-8 w-8 rounded-[var(--radius-md)]" />
                </div>
              </td>
            </tr>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
