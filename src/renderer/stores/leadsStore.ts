import { create } from "zustand";
import type { Lead } from "@/shared/types/lead";
import type { AsyncState } from "./types";

type LeadRow = {
  id: string;
  data: string;
  createdAt: Date;
  updatedAt: Date;
};

type LeadsState = AsyncState & {
  leads: LeadRow[];
  total: number;
  currentPage: number;
  pageSize: number;
};

type LeadsActions = {
  fetch: (page?: number) => Promise<void>;
  create: (lead: Omit<Lead, "id">) => Promise<string>;
  update: (id: string, data: Partial<Lead>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setPage: (page: number) => void;
  reset: () => void;
};

type LeadsStore = LeadsState & LeadsActions;

const PAGE_SIZE = 20;

const initialState: LeadsState = {
  leads: [],
  total: 0,
  currentPage: 1,
  pageSize: PAGE_SIZE,
  loading: "idle",
  error: null,
};

export const useLeadsStore = create<LeadsStore>((set, get) => ({
  ...initialState,

  fetch: async (page?: number) => {
    const targetPage = page ?? get().currentPage;
    const offset = (targetPage - 1) * PAGE_SIZE;

    set({ loading: "loading", error: null });
    try {
      const result = await window.api.leads.list({ limit: PAGE_SIZE, offset });
      set({
        leads: result.leads,
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

  create: async (lead) => {
    const { id } = await window.api.leads.create(lead);
    await get().fetch();
    return id;
  },

  update: async (id, data) => {
    await window.api.leads.update(id, data);
    await get().fetch();
  },

  remove: async (id) => {
    await window.api.leads.remove(id);
    await get().fetch();
  },

  setPage: (page) => {
    set({ currentPage: page });
    get().fetch(page);
  },

  reset: () => set(initialState),
}));
