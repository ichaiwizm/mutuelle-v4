import type { FlowWorker } from "../workers";
import type { WaitingWorkerEntry } from "./types";

export class TaskStateManager {
  private activeWorkers: Map<string, FlowWorker> = new Map();
  private pendingTasks: Set<string> = new Set();
  private waitingUserWorkers: Map<string, WaitingWorkerEntry> = new Map();

  get activeCount(): number { return this.activeWorkers.size + this.pendingTasks.size; }
  get waitingUserCount(): number { return this.waitingUserWorkers.size; }
  get runningCount(): number { return this.activeWorkers.size; }
  get pendingCount(): number { return this.pendingTasks.size; }

  addPending(taskId: string): void { this.pendingTasks.add(taskId); }
  removePending(taskId: string): void { this.pendingTasks.delete(taskId); }

  movePendingToActive(taskId: string, worker: FlowWorker): void {
    this.pendingTasks.delete(taskId);
    this.activeWorkers.set(taskId, worker);
  }

  removeActive(taskId: string): void { this.activeWorkers.delete(taskId); }
  getActiveWorker(taskId: string): FlowWorker | undefined { return this.activeWorkers.get(taskId); }

  addWaitingUser(taskId: string, entry: WaitingWorkerEntry): void { this.waitingUserWorkers.set(taskId, entry); }

  removeWaitingUser(taskId: string): WaitingWorkerEntry | undefined {
    const entry = this.waitingUserWorkers.get(taskId);
    if (entry) this.waitingUserWorkers.delete(taskId);
    return entry;
  }

  getWaitingUser(taskId: string): WaitingWorkerEntry | undefined { return this.waitingUserWorkers.get(taskId); }

  getActiveWorkersForRun(taskIds: Set<string>): [string, FlowWorker][] {
    return Array.from(this.activeWorkers.entries()).filter(([id]) => taskIds.has(id));
  }

  getWaitingWorkersForRun(taskIds: Set<string>): [string, WaitingWorkerEntry][] {
    return Array.from(this.waitingUserWorkers.entries()).filter(([id]) => taskIds.has(id));
  }

  getAllWaitingUserEntries(): [string, WaitingWorkerEntry][] {
    return Array.from(this.waitingUserWorkers.entries());
  }

  clear(): void {
    this.activeWorkers.clear();
    this.pendingTasks.clear();
    this.waitingUserWorkers.clear();
  }

  clearWaitingUserWorkers(): void { this.waitingUserWorkers.clear(); }
}
