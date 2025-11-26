import { AppHeader, type Tab } from "./AppHeader";

type AppLayoutProps = {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
  children: React.ReactNode;
};

export function AppLayout({ currentTab, onTabChange, children }: AppLayoutProps) {
  return (
    <div className="h-screen flex flex-col">
      <AppHeader currentTab={currentTab} onTabChange={onTabChange} />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
