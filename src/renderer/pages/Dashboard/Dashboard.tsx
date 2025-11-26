import { LoadingSpinner, ErrorAlert, EmptyState } from "@/renderer/components/common";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardGrid } from "./DashboardGrid";
import { useDashboardData } from "./useDashboardData";

type DashboardProps = {
  onNavigate: (tab: string) => void;
};

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { overview, loading, error, refresh, mail } = useDashboardData();

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="space-y-4">
        <DashboardHeader loading={loading} onRefresh={refresh} />
        <ErrorAlert error={error} onRetry={refresh} />
      </div>
    );
  }

  if (!overview) {
    return (
      <EmptyState
        title="Aucune donnée"
        description="Impossible de charger les données du dashboard"
        action={
          <button onClick={refresh} className="text-sm underline">
            Réessayer
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <DashboardHeader loading={loading} onRefresh={refresh} />
      <DashboardGrid overview={overview} mail={mail} onNavigate={onNavigate} />
    </div>
  );
}
