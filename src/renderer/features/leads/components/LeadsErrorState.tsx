import { Button } from '@/renderer/components/ui'

interface LeadsErrorStateProps {
  onRetry: () => void
}

export function LeadsErrorState({ onRetry }: LeadsErrorStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <p className="text-[var(--color-error)]">Failed to load leads</p>
      <Button onClick={onRetry}>Retry</Button>
    </div>
  )
}
