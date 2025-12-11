import { useState, useCallback } from "react";
import { Settings, RefreshCw, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/renderer/components/ui/Button";
import {
  CredentialCard,
  useCredentials,
  ConfigTabs,
  AutomationSection,
  DataSection,
} from "@/renderer/features/config";
import type { ConfigTab } from "@/renderer/features/config/types/automation";

export function ConfigPage() {
  const [activeTab, setActiveTab] = useState<ConfigTab>("credentials");
  const credentials = useCredentials();

  const handleRefresh = useCallback(() => {
    credentials.refresh();
  }, [credentials]);

  // Check if any platform is not configured
  const unconfiguredCount = credentials.platforms.filter(
    (p) => !credentials.states[p].info?.hasPassword
  ).length;

  const allLoading = credentials.platforms.every((p) => credentials.states[p].loading);

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">
              <Settings className="h-5 w-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[var(--color-text-primary)] tracking-tight">
                Configuration
              </h1>
              <p className="text-sm text-[var(--color-text-muted)]">
                Identifiants et paramètres d'automatisation
              </p>
            </div>
          </div>

          {activeTab === "credentials" && (
            <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={allLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${allLoading ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="mt-4">
          <ConfigTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto">
          {activeTab === "credentials" && (
            <div className="space-y-6 animate-fade-in">
              {/* Warning Banner */}
              {!allLoading && unconfiguredCount > 0 && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-400">Configuration requise</h4>
                    <p className="text-sm text-amber-400/80 mt-0.5">
                      {unconfiguredCount === 1
                        ? "Une plateforme nécessite une configuration pour que l'automatisation fonctionne."
                        : `${unconfiguredCount} plateformes nécessitent une configuration pour que l'automatisation fonctionne.`}
                    </p>
                  </div>
                </div>
              )}

              {/* Section Header */}
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-[var(--color-text-muted)]" />
                <h2 className="text-lg font-medium text-[var(--color-text-primary)]">
                  Identifiants des plateformes
                </h2>
              </div>

              {/* Credential Cards */}
              <div className="space-y-4">
                {credentials.platforms.map((platform) => (
                  <CredentialCard
                    key={platform}
                    platform={platform}
                    state={credentials.states[platform]}
                    onSave={(data) => credentials.save(platform, data)}
                    onDelete={() => credentials.remove(platform)}
                    onTest={() => credentials.test(platform)}
                    onResetTest={() => credentials.resetTestStatus(platform)}
                  />
                ))}
              </div>

              {/* Info Footer */}
              <div className="pt-4 border-t border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  Vos identifiants sont stockés localement et chiffrés avec AES-256-GCM.
                  Ils ne sont jamais envoyés à des serveurs tiers.
                  <br />
                  Le bouton "Tester" effectue une tentative de connexion réelle pour vérifier
                  la validité des identifiants.
                </p>
              </div>
            </div>
          )}
          {activeTab === "automation" && <AutomationSection />}
          {activeTab === "data" && <DataSection />}
        </div>
      </div>
    </div>
  );
}
