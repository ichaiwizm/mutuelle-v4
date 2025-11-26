import {
  MailStatusCard,
  LeadsStatsCard,
  RunsStatsCard,
  PausedFlowsCard,
  ProductsCard,
} from "@/renderer/components/dashboard";
import type { DashboardOverview } from "@/shared/ipc/contracts";

type DashboardGridProps = {
  overview: DashboardOverview;
  mail: {
    isConnected: boolean;
    email?: string;
    connecting: boolean;
    fetching: boolean;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    cancel: () => Promise<void>;
    fetchEmails: (days: number) => Promise<unknown>;
  };
  onNavigate: (tab: string) => void;
};

export function DashboardGrid({ overview, mail, onNavigate }: DashboardGridProps) {
  const handleFetchFromGmail = async () => {
    await mail.fetchEmails(7);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <MailStatusCard
        isConnected={mail.isConnected}
        email={mail.email}
        connecting={mail.connecting}
        onConnect={mail.connect}
        onDisconnect={mail.disconnect}
        onCancel={mail.cancel}
      />

      <LeadsStatsCard
        total={overview.leads.total}
        loading={false}
        fetching={mail.fetching}
        onFetchFromGmail={handleFetchFromGmail}
        onViewAll={() => onNavigate("leads")}
      />

      <RunsStatsCard
        totalRuns={overview.automation.totalRuns}
        recentRuns={overview.automation.recentRuns}
        onViewQueue={() => onNavigate("automation")}
        onNewRun={() => onNavigate("automation")}
      />

      <PausedFlowsCard
        pausedCount={overview.flowStates.pausedCount}
        onViewPaused={() => onNavigate("automation")}
      />

      <ProductsCard
        activeProducts={overview.products.active}
        onViewConfig={() => onNavigate("config")}
      />
    </div>
  );
}
