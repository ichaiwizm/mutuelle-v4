import { NavButton } from "./NavButton";

export type Tab = "dashboard" | "leads" | "automation" | "config";

type AppHeaderProps = {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
};

const tabs: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "leads", label: "Leads" },
  { id: "automation", label: "Automatisation" },
  { id: "config", label: "Config" },
];

export function AppHeader({ currentTab, onTabChange }: AppHeaderProps) {
  return (
    <header className="p-3 border-b bg-background flex items-center gap-2">
      {tabs.map((tab) => (
        <NavButton
          key={tab.id}
          active={currentTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </NavButton>
      ))}
    </header>
  );
}
