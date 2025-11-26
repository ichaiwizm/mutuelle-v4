import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/renderer/components/common";

type DashboardHeaderProps = {
  loading: boolean;
  onRefresh: () => void;
};

export function DashboardHeader({ loading, onRefresh }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Vue d'ensemble de votre activité
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
        {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
        Actualiser
      </Button>
    </div>
  );
}
