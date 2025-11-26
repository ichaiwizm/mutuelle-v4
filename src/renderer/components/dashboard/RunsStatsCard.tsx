import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RunRow } from "./RunRow";
import type { Run } from "@/shared/types/run";

type RunsStatsCardProps = {
  totalRuns: number;
  recentRuns: Run[];
  onViewQueue: () => void;
  onNewRun: () => void;
};

export function RunsStatsCard({
  totalRuns,
  recentRuns,
  onViewQueue,
  onNewRun,
}: RunsStatsCardProps) {
  const activeCount = recentRuns.filter(
    (r) => r.status === "running" || r.status === "queued"
  ).length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <RocketIcon />
          Automatisation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold">{activeCount}</p>
          <span className="text-sm text-muted-foreground">en cours</span>
        </div>

        {recentRuns.length > 0 && (
          <div className="space-y-1">
            {recentRuns.slice(0, 3).map((run) => (
              <RunRow key={run.id} run={run} />
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onViewQueue}>
            Voir queue
          </Button>
          <Button size="sm" onClick={onNewRun}>
            Nouveau
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RocketIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  );
}
