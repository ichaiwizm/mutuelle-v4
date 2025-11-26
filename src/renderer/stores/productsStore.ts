import { create } from "zustand";
import type { ProductConfiguration, ProductStatus } from "@/shared/types/product";
import type { AsyncState } from "./types";

type ProductsState = AsyncState & {
  configs: ProductConfiguration[];
  activeConfigs: ProductConfiguration[];
  statuses: ProductStatus[];
};

type ProductsActions = {
  fetchConfigs: () => Promise<void>;
  fetchActiveConfigs: () => Promise<void>;
  fetchStatuses: () => Promise<void>;
  updateStatus: (platform: string, product: string, status: ProductStatus["status"]) => Promise<void>;
  reset: () => void;
};

type ProductsStore = ProductsState & ProductsActions;

const initialState: ProductsState = {
  configs: [],
  activeConfigs: [],
  statuses: [],
  loading: "idle",
  error: null,
};

export const useProductsStore = create<ProductsStore>((set, get) => ({
  ...initialState,

  fetchConfigs: async () => {
    set({ loading: "loading", error: null });
    try {
      const configs = await window.api.products.listConfigs();
      set({ configs, loading: "idle" });
    } catch (err) {
      const error = err as Error & { code?: string };
      set({
        loading: "error",
        error: { code: error.code ?? "UNKNOWN", message: error.message },
      });
    }
  },

  fetchActiveConfigs: async () => {
    try {
      const activeConfigs = await window.api.products.listActiveConfigs();
      set({ activeConfigs });
    } catch (err) {
      const error = err as Error & { code?: string };
      set({
        error: { code: error.code ?? "UNKNOWN", message: error.message },
      });
    }
  },

  fetchStatuses: async () => {
    try {
      const statuses = await window.api.products.listStatuses();
      set({ statuses });
    } catch (err) {
      const error = err as Error & { code?: string };
      set({
        error: { code: error.code ?? "UNKNOWN", message: error.message },
      });
    }
  },

  updateStatus: async (platform, product, status) => {
    await window.api.products.updateStatus({ platform, product, status });
    await get().fetchStatuses();
    await get().fetchActiveConfigs();
  },

  reset: () => set(initialState),
}));
