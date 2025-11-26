import { create } from "zustand";
import type { DashboardOverview } from "@/shared/ipc/contracts";
import type { AsyncState, StoreError } from "./types";

type DashboardState = AsyncState & {
  overview: DashboardOverview | null;
  lastFetchedAt: number | null;
};

type DashboardActions = {
  fetch: () => Promise<void>;
  reset: () => void;
};

type DashboardStore = DashboardState & DashboardActions;

const initialState: DashboardState = {
  overview: null,
  loading: "idle",
  error: null,
  lastFetchedAt: null,
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  ...initialState,

  fetch: async () => {
    set({ loading: "loading", error: null });
    try {
      const overview = await window.api.dashboard.overview();
      set({ overview, loading: "idle", lastFetchedAt: Date.now() });
    } catch (err) {
      const error = err as Error & { code?: string };
      set({
        loading: "error",
        error: { code: error.code ?? "UNKNOWN", message: error.message },
      });
    }
  },

  reset: () => set(initialState),
}));
