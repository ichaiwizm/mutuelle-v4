import type { LogContext } from "@/main/services/logger";

export type PoolComponent =
  | "BrowserManager"
  | "ContextFactory"
  | "ProcessHealthChecker"
  | "Chromium"
  | "FlowPool"
  | "FlowWorker"
  | "GlobalPool"
  | "TaskExecutor"
  | "QueueProcessor"
  | "StateManager"
  | "WorkerLifecycle"
  | "PageLifecycle"
  | "WindowBridge"
  | "WindowRegistry"
  | "CDPController"
  | "ShutdownManager"
  | "RunHandleFactory"
  | "TaskQueue";

export interface PoolLogContext extends Omit<LogContext, "service"> {
  taskId?: string;
  workerId?: string;
  component?: PoolComponent;
}

export function shortId(id: string | undefined): string {
  if (!id) return "N/A";
  return id.substring(0, 8) + "...";
}
