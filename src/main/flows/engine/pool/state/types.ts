import type { BrowserContext } from "playwright";
import type { FlowWorker } from "../workers";
import type { GlobalTask } from "../types/global";

/** Entry for workers in waiting_user state */
export type WaitingWorkerEntry = {
  worker: FlowWorker;
  context: BrowserContext;
  task: GlobalTask;
};
