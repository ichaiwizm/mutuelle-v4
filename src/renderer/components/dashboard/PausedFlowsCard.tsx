import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "../common/StatusBadge";

type PausedFlowsCardProps = {
  pausedCount: number;
  onViewPaused: () => void;
};

export function PausedFlowsCard({ pausedCount, onViewPaused }: PausedFlowsCardProps) {
  const hasPaused = pausedCount > 0;

  return (
    <Card className={hasPaused ? "border-yellow-500/50" : undefined}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <PauseIcon />
          Flows en pause
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold">{pausedCount}</p>
          {hasPaused && (
            <StatusBadge variant="warning">Action requise</StatusBadge>
          )}
        </div>

        {hasPaused ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onViewPaused}
          >
            Voir et reprendre
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">
            Aucun flow en pause
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function PauseIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
