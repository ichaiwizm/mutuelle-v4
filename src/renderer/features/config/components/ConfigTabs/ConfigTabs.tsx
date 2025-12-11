import { useRef, useEffect, useState } from "react";
import { Shield, Cpu, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConfigTab } from "../../types/automation";

interface TabConfig {
  id: ConfigTab;
  label: string;
  icon: typeof Shield;
}

const TABS: TabConfig[] = [
  { id: "credentials", label: "Identifiants", icon: Shield },
  { id: "automation", label: "Automatisation", icon: Cpu },
  { id: "data", label: "Données", icon: Database },
];

interface ConfigTabsProps {
  activeTab: ConfigTab;
  onTabChange: (tab: ConfigTab) => void;
}

export function ConfigTabs({ activeTab, onTabChange }: ConfigTabsProps) {
  const tabRefs = useRef<Map<ConfigTab, HTMLButtonElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Update indicator position when active tab changes
  useEffect(() => {
    const activeElement = tabRefs.current.get(activeTab);
    if (activeElement) {
      const { offsetLeft, offsetWidth } = activeElement;
      setIndicatorStyle({ left: offsetLeft, width: offsetWidth });
    }
  }, [activeTab]);

  return (
    <div className="relative">
      {/* Tabs Container */}
      <div className="flex gap-1 border-b border-[var(--color-border)]">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.id, el);
              }}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-inset",
                isActive
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"
                )}
              />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Animated Indicator */}
      <div
        className="absolute bottom-0 h-0.5 bg-[var(--color-primary)] transition-all duration-200 ease-out"
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
      />
    </div>
  );
}
