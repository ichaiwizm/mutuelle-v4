import { useState, useCallback, useEffect } from "react";
import type { ProductSettings, AllProductSettings } from "../types/automation";
import { DEFAULT_PRODUCT_SETTINGS } from "../types/automation";

export function useProductSettings() {
  const [settings, setSettings] = useState<AllProductSettings>({});
  const [loading, setLoading] = useState(true);

  // Load settings from database on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const list = await window.api.automationSettings.list();
        const mapped: AllProductSettings = {};
        for (const item of list) {
          mapped[item.flowKey] = {
            headless: item.headless,
            stopAtStep: item.stopAtStep,
          };
        }
        setSettings(mapped);
      } catch (error) {
        console.error("Failed to load automation settings:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const getSettings = useCallback(
    (flowKey: string): ProductSettings => {
      return settings[flowKey] || DEFAULT_PRODUCT_SETTINGS;
    },
    [settings]
  );

  const updateHeadless = useCallback(
    async (flowKey: string, headless: boolean) => {
      // Optimistic update
      setSettings((prev) => {
        const current = prev[flowKey] || DEFAULT_PRODUCT_SETTINGS;
        return {
          ...prev,
          [flowKey]: {
            ...current,
            headless,
            // Reset stopAtStep when switching to headless
            ...(headless ? { stopAtStep: null } : {}),
          },
        };
      });

      try {
        await window.api.automationSettings.save(flowKey, {
          headless,
          ...(headless ? { stopAtStep: null } : {}),
        });
      } catch (error) {
        console.error("Failed to save headless setting:", error);
        // Revert on error - reload from DB
        const result = await window.api.automationSettings.get(flowKey);
        if (result) {
          setSettings((prev) => ({
            ...prev,
            [flowKey]: { headless: result.headless, stopAtStep: result.stopAtStep },
          }));
        }
      }
    },
    []
  );

  const updateStopAtStep = useCallback(
    async (flowKey: string, stepId: string | null) => {
      // Optimistic update
      setSettings((prev) => {
        const current = prev[flowKey] || DEFAULT_PRODUCT_SETTINGS;
        return {
          ...prev,
          [flowKey]: { ...current, stopAtStep: stepId },
        };
      });

      try {
        await window.api.automationSettings.save(flowKey, { stopAtStep: stepId });
      } catch (error) {
        console.error("Failed to save stopAtStep setting:", error);
        // Revert on error
        const result = await window.api.automationSettings.get(flowKey);
        if (result) {
          setSettings((prev) => ({
            ...prev,
            [flowKey]: { headless: result.headless, stopAtStep: result.stopAtStep },
          }));
        }
      }
    },
    []
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await window.api.automationSettings.list();
      const mapped: AllProductSettings = {};
      for (const item of list) {
        mapped[item.flowKey] = {
          headless: item.headless,
          stopAtStep: item.stopAtStep,
        };
      }
      setSettings(mapped);
    } catch (error) {
      console.error("Failed to refresh automation settings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    settings,
    loading,
    getSettings,
    updateHeadless,
    updateStopAtStep,
    refresh,
  };
}
