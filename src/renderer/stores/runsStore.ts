import { create } from "zustand";
import type { Run, RunItem } from "@/shared/types/run";
import type { AutomationEnqueueItem } from "@/shared/ipc/contracts";
import type { AsyncState } from "./types";

type RunWithItems = Run & { items: RunItem[] };

type RunsState = AsyncState & {
  runs: Run[];
  total: number;
  currentRun: RunWithItems | null;
  currentPage: number;
  pageSize: number;
};

type RunsActions = {
  fetch: (page?: number) => Promise<void>;
  fetchOne: (runId: string) => Promise<void>;
  enqueue: (items: AutomationEnqueueItem[]) => Promise<string>;
  cancel: (runId: string) => Promise<void>;
  setPage: (page: number) => void;
  reset: () => void;
};

type RunsStore = RunsState & RunsActions;

const PAGE_SIZE = 20;

const initialState: RunsState = {
  runs: [],
  total: 0,
  currentRun: null,
  currentPage: 1,
  pageSize: PAGE_SIZE,
  loading: "idle",
  error: null,
};

export const useRunsStore = create<RunsStore>((set, get) => ({
  ...initialState,

  fetch: async (page?: number) => {
    const targetPage = page ?? get().currentPage;
    const offset = (targetPage - 1) * PAGE_SIZE;

    set({ loading: "loading", error: null });
    try {
      const result = await window.api.automation.list({ limit: PAGE_SIZE, offset });
      set({
        runs: result.runs,
        total: result.total,
        currentPage: targetPage,
        loading: "idle",
      });
    } catch (err) {
      const error = err as Error & { code?: string };
      set({
        loading: "error",
        error: { code: error.code ?? "UNKNOWN", message: error.message },
      });
    }
  },

  fetchOne: async (runId) => {
    set({ loading: "loading", error: null });
    try {
      const run = await window.api.automation.get(runId);
      set({ currentRun: run, loading: "idle" });
    } catch (err) {
      const error = err as Error & { code?: string };
      set({
        loading: "error",
        error: { code: error.code ?? "UNKNOWN", message: error.message },
      });
    }
  },

  enqueue: async (items) => {
    const result = await window.api.automation.enqueue(items);
    await get().fetch();
    return result.runId;
  },

  cancel: async (runId) => {
    await window.api.automation.cancel(runId);
    await get().fetch();
  },

  setPage: (page) => {
    set({ currentPage: page });
    get().fetch(page);
  },

  reset: () => set(initialState),
}));
