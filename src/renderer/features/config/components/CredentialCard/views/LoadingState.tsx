import { Card } from "@/renderer/components/ui/Card";

export function LoadingState() {
  return (
    <Card className="p-6 border-[var(--color-border)] animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-[var(--color-border)]" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-32 rounded bg-[var(--color-border)]" />
          <div className="h-4 w-48 rounded bg-[var(--color-border)]" />
        </div>
      </div>
    </Card>
  );
}
