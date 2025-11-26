import { useState, useCallback } from "react";
import { AppLayout, type Tab } from "./components/layout";
import Dashboard from "./pages/Dashboard";
import ConfigPage from "./pages/Config/ConfigPage";
import LeadsPage from "./pages/Leads/LeadsPage";
import AutomationPage from "./pages/Automation/AutomationPage";

export default function App() {
  const [tab, setTab] = useState<Tab>("dashboard");

  const handleNavigate = useCallback((targetTab: string) => {
    if (isValidTab(targetTab)) {
      setTab(targetTab);
    }
  }, []);

  return (
    <AppLayout currentTab={tab} onTabChange={setTab}>
      {tab === "dashboard" && <Dashboard onNavigate={handleNavigate} />}
      {tab === "config" && <ConfigPage />}
      {tab === "leads" && <LeadsPage />}
      {tab === "automation" && <AutomationPage />}
    </AppLayout>
  );
}

function isValidTab(tab: string): tab is Tab {
  return ["dashboard", "leads", "automation", "config"].includes(tab);
}
