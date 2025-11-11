import type { Ipc } from "@/shared/ipc/contracts";

declare global {
  interface Window {
    api: Ipc;
  }
}

export {};
