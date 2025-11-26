import { create } from "zustand";
import type { MailStatus, MailFetchResult } from "@/shared/ipc/contracts";
import type { AsyncState, StoreError } from "./types";

type MailState = AsyncState & {
  status: MailStatus | null;
  lastFetchResult: MailFetchResult | null;
  connecting: boolean;
  fetching: boolean;
};

type MailActions = {
  checkStatus: () => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  cancel: () => Promise<void>;
  fetchEmails: (days: number) => Promise<MailFetchResult>;
  reset: () => void;
};

type MailStore = MailState & MailActions;

const initialState: MailState = {
  status: null,
  lastFetchResult: null,
  loading: "idle",
  error: null,
  connecting: false,
  fetching: false,
};

export const useMailStore = create<MailStore>((set, get) => ({
  ...initialState,

  checkStatus: async () => {
    set({ loading: "loading" });
    try {
      const status = await window.api.mail.status();
      set({ status, loading: "idle" });
    } catch (err) {
      const error = err as Error & { code?: string };
      set({
        loading: "error",
        error: { code: error.code ?? "UNKNOWN", message: error.message },
      });
    }
  },

  connect: async () => {
    set({ connecting: true, error: null });
    try {
      const result = await window.api.mail.connect();
      set({ status: { ok: true, email: result.email }, connecting: false });
    } catch (err) {
      const error = err as Error & { code?: string };
      set({
        connecting: false,
        error: { code: error.code ?? "UNKNOWN", message: error.message },
      });
      throw err;
    }
  },

  disconnect: async () => {
    try {
      await window.api.mail.disconnect();
      set({ status: { ok: false }, lastFetchResult: null });
    } catch (err) {
      const error = err as Error & { code?: string };
      set({
        error: { code: error.code ?? "UNKNOWN", message: error.message },
      });
      throw err;
    }
  },

  cancel: async () => {
    await window.api.mail.cancel();
    set({ connecting: false, error: null });
  },

  fetchEmails: async (days: number) => {
    set({ fetching: true, error: null });
    try {
      const result = await window.api.mail.fetch({ days });
      set({ lastFetchResult: result, fetching: false });
      return result;
    } catch (err) {
      const error = err as Error & { code?: string };
      set({
        fetching: false,
        error: { code: error.code ?? "UNKNOWN", message: error.message },
      });
      throw err;
    }
  },

  reset: () => set(initialState),
}));
