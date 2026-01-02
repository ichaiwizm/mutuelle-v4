import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { ProductConfiguration } from "@/shared/types/product";
import type { Lead } from "@/shared/types/lead";
import type { UseNewRunModalOptions } from "./types";
import type { ErrorCode } from "@/shared/errors";
import { getMissingPlatforms } from "@/renderer/lib/credentials";

export function useNewRunModal({
  isOpen,
  preSelectedLeadIds,
  onSuccess,
  onClose,
}: UseNewRunModalOptions) {
  const navigate = useNavigate();

  // Data state
  const [products, setProducts] = useState<ProductConfiguration[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingLeads, setLoadingLeads] = useState(true);

  // Credentials state - platforms that have credentials configured
  const [configuredPlatforms, setConfiguredPlatforms] = useState<Set<string>>(new Set());

  // Selection state
  const [selectedFlows, setSelectedFlows] = useState<Set<string>>(new Set());
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Submission state
  const [submitting, setSubmitting] = useState(false);

  // Fetch products when modal opens
  useEffect(() => {
    if (!isOpen) return;

    // Reset state when opening
    setSelectedFlows(new Set());
    // Pre-select leads if provided
    setSelectedLeads(preSelectedLeadIds ? new Set(preSelectedLeadIds) : new Set());
    setSearchQuery("");

    // Fetch active products
    setLoadingProducts(true);
    window.api.products
      .listActiveConfigs()
      .then((configs) => {
        setProducts(configs);
      })
      .catch((error) => {
        console.error("Failed to fetch products:", error);
        toast.error("Erreur lors du chargement des produits");
      })
      .finally(() => setLoadingProducts(false));

    // Fetch configured platforms (credentials)
    window.api.credentials
      .list()
      .then((platforms) => {
        setConfiguredPlatforms(new Set(platforms));
      })
      .catch((error) => {
        console.error("Failed to fetch credentials:", error);
      });
  }, [isOpen, preSelectedLeadIds]);

  // Fetch leads with server-side search (debounced)
  useEffect(() => {
    if (!isOpen) return;

    setLoadingLeads(true);
    const timeoutId = setTimeout(
      () => {
        window.api.leads
          .list({ limit: 500, offset: 0, search: searchQuery || undefined })
          .then((result) => {
            // Parse lead data from JSON string
            const parsedLeads = result.leads.map((row) => ({
              id: row.id,
              ...JSON.parse(row.data),
            })) as Lead[];
            setLeads(parsedLeads);
          })
          .catch((error) => {
            console.error("Failed to fetch leads:", error);
            toast.error("Erreur lors du chargement des leads");
          })
          .finally(() => setLoadingLeads(false));
      },
      searchQuery ? 300 : 0
    ); // Debounce only when searching

    return () => clearTimeout(timeoutId);
  }, [isOpen, searchQuery]);

  // Toggle flow selection
  const toggleFlow = useCallback((flowKey: string) => {
    setSelectedFlows((prev) => {
      const next = new Set(prev);
      if (next.has(flowKey)) {
        next.delete(flowKey);
      } else {
        next.add(flowKey);
      }
      return next;
    });
  }, []);

  // Toggle lead selection
  const toggleLead = useCallback((leadId: string) => {
    setSelectedLeads((prev) => {
      const next = new Set(prev);
      if (next.has(leadId)) {
        next.delete(leadId);
      } else {
        next.add(leadId);
      }
      return next;
    });
  }, []);

  // Select/deselect all flows
  const toggleAllFlows = useCallback(() => {
    if (selectedFlows.size === products.length) {
      setSelectedFlows(new Set());
    } else {
      setSelectedFlows(new Set(products.map((p) => p.flowKey)));
    }
  }, [products, selectedFlows.size]);

  // Select/deselect all visible leads
  const toggleAllLeads = useCallback(() => {
    if (selectedLeads.size === leads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(leads.map((l) => l.id)));
    }
  }, [leads, selectedLeads.size]);

  // Quick select last N leads
  const selectLastN = useCallback(
    (n: number) => {
      const lastN = leads.slice(0, n).map((l) => l.id);
      setSelectedLeads(new Set(lastN));
    },
    [leads]
  );

  // Calculate total tasks
  const totalTasks = selectedFlows.size * selectedLeads.size;

  // Calculate missing platforms for selected flows
  const missingPlatforms = useMemo(
    () => getMissingPlatforms(selectedFlows, configuredPlatforms),
    [selectedFlows, configuredPlatforms]
  );

  const canSubmit =
    selectedFlows.size > 0 &&
    selectedLeads.size > 0 &&
    missingPlatforms.size === 0 &&
    !submitting;

  // Calculate estimated duration
  const estimatedDuration = useMemo(() => {
    if (selectedFlows.size === 0 || selectedLeads.size === 0) return 0;

    // Get average duration per product
    const selectedProducts = products.filter((p) => selectedFlows.has(p.flowKey));
    const avgDurationPerTask =
      selectedProducts.reduce((acc, p) => {
        // Use metadata.estimatedTotalDuration if available, otherwise default to 60s
        const duration = p.metadata?.estimatedTotalDuration ?? 60000;
        return acc + duration;
      }, 0) / (selectedProducts.length || 1);

    // Calculate total with parallelism factor (3 concurrent tasks)
    const parallelFactor = 3;
    const totalDuration = (totalTasks * avgDurationPerTask) / parallelFactor;

    return totalDuration;
  }, [products, selectedFlows, selectedLeads.size, totalTasks]);

  // Quick select options
  const quickSelectOptions = useMemo(() => {
    const options = [];
    if (leads.length >= 10) options.push(10);
    if (leads.length >= 50) options.push(50);
    if (leads.length >= 100) options.push(100);
    return options;
  }, [leads.length]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    setSubmitting(true);

    try {
      // Generate matrix of flowKey × leadId
      const items: Array<{ flowKey: string; leadId: string }> = [];
      for (const flowKey of selectedFlows) {
        for (const leadId of selectedLeads) {
          items.push({ flowKey, leadId });
        }
      }

      const result = await window.api.automation.enqueue(items);
      toast.success(
        `${items.length} tâche${items.length > 1 ? "s" : ""} lancée${items.length > 1 ? "s" : ""}`
      );
      onSuccess?.();
      onClose();

      // Navigate to live view
      navigate(`/automation/runs/${result.runId}`);
    } catch (error) {
      console.error("Failed to enqueue automation:", error);

      // Handle structured errors with specific messages
      const err = error as { code?: ErrorCode; message?: string; details?: { platforms?: string[] } };

      if (err.code === "CONFIG_MISSING") {
        toast.error("Configuration manquante", {
          description: err.message || "Veuillez configurer les identifiants dans les paramètres.",
          action: {
            label: "Configurer",
            onClick: () => {
              onClose();
              navigate("/config");
            },
          },
          duration: 10000,
        });
      } else {
        toast.error("Erreur lors du lancement", {
          description: err.message || "Une erreur inattendue s'est produite.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, selectedFlows, selectedLeads, onSuccess, onClose, navigate]);

  return {
    // Data
    products,
    leads,
    loadingProducts,
    loadingLeads,
    // Selection
    selectedFlows,
    selectedLeads,
    toggleFlow,
    toggleLead,
    toggleAllFlows,
    toggleAllLeads,
    selectLastN,
    // Search
    searchQuery,
    setSearchQuery,
    // Computed
    totalTasks,
    canSubmit,
    estimatedDuration,
    quickSelectOptions,
    // Credentials
    configuredPlatforms,
    missingPlatforms,
    // Submit
    submitting,
    handleSubmit,
  };
}
