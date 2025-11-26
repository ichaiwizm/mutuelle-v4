import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "../common/LoadingSpinner";

type LeadsStatsCardProps = {
  total: number;
  loading: boolean;
  fetching: boolean;
  onFetchFromGmail: () => void;
  onViewAll: () => void;
};

export function LeadsStatsCard({
  total,
  loading,
  fetching,
  onFetchFromGmail,
  onViewAll,
}: LeadsStatsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <UsersIcon />
          Leads
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <p className="text-3xl font-bold">{total}</p>
        )}
        <p className="text-xs text-muted-foreground">leads enregistrés</p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onFetchFromGmail}
            disabled={fetching}
          >
            {fetching ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            {fetching ? "Import..." : "Import Gmail"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            Voir tout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function UsersIcon() {
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
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
      />
    </svg>
  );
}
