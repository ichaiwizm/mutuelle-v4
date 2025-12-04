import type { FlowWorker } from "../workers";
import type { WaitingWorkerEntry } from "./types";

/**
 * TaskStateManager - Manages task execution state.
 * Tracks active workers, pending tasks, and waiting_user workers.
 */
export class TaskStateManager {
  private activeWorkers: Map<string, FlowWorker> = new Map();
  private pendingTasks: Set<string> = new Set();
  private waitingUserWorkers: Map<string, WaitingWorkerEntry> = new Map();

  /** Get total active count (active + pending) */
  get activeCount(): number {
    return this.activeWorkers.size + this.pendingTasks.size;
  }

  /** Get count of workers in waiting_user state */
  get waitingUserCount(): number {
    return this.waitingUserWorkers.size;
  }

  /** Get active workers count only */
  get runningCount(): number {
    return this.activeWorkers.size;
  }

  /** Get pending tasks count only */
  get pendingCount(): number {
    return this.pendingTasks.size;
  }

  /** Add a task to pending set (reserve slot) */
  addPending(taskId: string): void {
    console.log(`[STATE_MANAGER] Adding task ${taskId.substring(0, 8)}... to pending`);
    this.pendingTasks.add(taskId);
    console.log(`[STATE_MANAGER] Pending tasks: ${this.pendingTasks.size}`);
  }

  /** Remove a task from pending set */
  removePending(taskId: string): void {
    this.pendingTasks.delete(taskId);
  }

  /** Move task from pending to active */
  movePendingToActive(taskId: string, worker: FlowWorker): void {
    console.log(`[STATE_MANAGER] Moving task ${taskId.substring(0, 8)}... from pending to active`);
    this.pendingTasks.delete(taskId);
    this.activeWorkers.set(taskId, worker);
    console.log(`[STATE_MANAGER] Active: ${this.activeWorkers.size} | Pending: ${this.pendingTasks.size}`);
  }

  /** Remove task from active workers */
  removeActive(taskId: string): void {
    this.activeWorkers.delete(taskId);
    console.log(`[STATE_MANAGER] Active workers after removal: ${this.activeWorkers.size}`);
  }

  /** Get an active worker by task ID */
  getActiveWorker(taskId: string): FlowWorker | undefined {
    return this.activeWorkers.get(taskId);
  }

  /** Add worker to waiting_user state */
  addWaitingUser(taskId: string, entry: WaitingWorkerEntry): void {
    console.log(`[STATE_MANAGER] Adding task ${taskId.substring(0, 8)}... to waiting_user`);
    this.waitingUserWorkers.set(taskId, entry);
  }

  /** Remove worker from waiting_user state */
  removeWaitingUser(taskId: string): WaitingWorkerEntry | undefined {
    const entry = this.waitingUserWorkers.get(taskId);
    if (entry) {
      this.waitingUserWorkers.delete(taskId);
    }
    return entry;
  }

  /** Get waiting_user entry by task ID */
  getWaitingUser(taskId: string): WaitingWorkerEntry | undefined {
    return this.waitingUserWorkers.get(taskId);
  }

  /** Get all active workers for a specific run */
  getActiveWorkersForRun(taskIds: Set<string>): [string, FlowWorker][] {
    return Array.from(this.activeWorkers.entries()).filter(([taskId]) => taskIds.has(taskId));
  }

  /** Get all waiting_user workers for a specific run */
  getWaitingWorkersForRun(taskIds: Set<string>): [string, WaitingWorkerEntry][] {
    return Array.from(this.waitingUserWorkers.entries()).filter(([taskId]) => taskIds.has(taskId));
  }

  /** Get all waiting_user entries */
  getAllWaitingUserEntries(): [string, WaitingWorkerEntry][] {
    return Array.from(this.waitingUserWorkers.entries());
  }

  /** Clear all state */
  clear(): void {
    this.activeWorkers.clear();
    this.pendingTasks.clear();
    this.waitingUserWorkers.clear();
  }

  /** Clear waiting_user workers only */
  clearWaitingUserWorkers(): void {
    this.waitingUserWorkers.clear();
  }
}
