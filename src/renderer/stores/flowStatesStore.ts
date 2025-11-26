import { create } from "zustand";
import type { FlowStateDTO } from "@/shared/ipc/contracts";
import type { AsyncState } from "./types";

type FlowStatesState = AsyncState & {
  pausedFlows: FlowStateDTO[];
  resuming: string | null;
};

type FlowStatesActions = {
  fetchPaused: () => Promise<void>;
  resume: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reset: () => void;
};

type FlowStatesStore = FlowStatesState & FlowStatesActions;

const initialState: FlowStatesState = {
  pausedFlows: [],
  loading: "idle",
  error: null,
  resuming: null,
};

export const useFlowStatesStore = create<FlowStatesStore>((set, get) => ({
  ...initialState,

  fetchPaused: async () => {
    set({ loading: "loading", error: null });
    try {
      const pausedFlows = await window.api.flowStates.listPaused();
      set({ pausedFlows, loading: "idle" });
    } catch (err) {
      const error = err as Error & { code?: string };
      set({
        loading: "error",
        error: { code: error.code ?? "UNKNOWN", message: error.message },
      });
    }
  },

  resume: async (id) => {
    set({ resuming: id, error: null });
    try {
      await window.api.flowStates.resume(id);
      await get().fetchPaused();
    } catch (err) {
      const error = err as Error & { code?: string };
      set({
        error: { code: error.code ?? "UNKNOWN", message: error.message },
      });
      throw err;
    } finally {
      set({ resuming: null });
    }
  },

  remove: async (id) => {
    await window.api.flowStates.delete(id);
    await get().fetchPaused();
  },

  reset: () => set(initialState),
}));
