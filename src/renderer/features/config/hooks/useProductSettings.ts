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
            autoSubmit: item.autoSubmit,
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
            // Reset autoSubmit to true when switching to headless (no point in stopping if invisible)
            ...(headless ? { autoSubmit: true } : {}),
          },
        };
      });

      try {
        await window.api.automationSettings.save(flowKey, {
          headless,
          ...(headless ? { autoSubmit: true } : {}),
        });
      } catch (error) {
        console.error("Failed to save headless setting:", error);
        // Revert on error - reload from DB
        const result = await window.api.automationSettings.get(flowKey);
        if (result) {
          setSettings((prev) => ({
            ...prev,
            [flowKey]: { headless: result.headless, autoSubmit: result.autoSubmit },
          }));
        }
      }
    },
    []
  );

  const updateAutoSubmit = useCallback(
    async (flowKey: string, autoSubmit: boolean) => {
      // Optimistic update
      setSettings((prev) => {
        const current = prev[flowKey] || DEFAULT_PRODUCT_SETTINGS;
        return {
          ...prev,
          [flowKey]: { ...current, autoSubmit },
        };
      });

      try {
        await window.api.automationSettings.save(flowKey, { autoSubmit });
      } catch (error) {
        console.error("Failed to save autoSubmit setting:", error);
        // Revert on error
        const result = await window.api.automationSettings.get(flowKey);
        if (result) {
          setSettings((prev) => ({
            ...prev,
            [flowKey]: { headless: result.headless, autoSubmit: result.autoSubmit },
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
          autoSubmit: item.autoSubmit,
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
    updateAutoSubmit,
    refresh,
  };
}
