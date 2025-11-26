/**
 * Common types for all stores
 */

export type LoadingState = "idle" | "loading" | "error";

export type StoreError = {
  code: string;
  message: string;
};

export type AsyncState = {
  loading: LoadingState;
  error: StoreError | null;
};
