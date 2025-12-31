import type { GlobalTask } from "./types/global";

export class TaskQueue {
  private queue: GlobalTask[] = [];

  add(tasks: GlobalTask[]): void {
    this.queue.push(...tasks);
    this.sortByPriority();
  }

  remove(taskId: string): boolean {
    const idx = this.queue.findIndex((t) => t.id === taskId);
    if (idx !== -1) { this.queue.splice(idx, 1); return true; }
    return false;
  }

  getNext(): GlobalTask | undefined {
    const idx = this.queue.findIndex((t) => t.status === "queued");
    if (idx === -1) return undefined;
    const task = this.queue[idx];
    task.status = "running";
    return task;
  }

  hasQueuedTasks(): boolean { return this.queue.some((t) => t.status === "queued"); }
  getTasksForRun(runId: string): GlobalTask[] { return this.queue.filter((t) => t.runId === runId); }

  removeQueuedTasksForRun(runId: string): number {
    const orig = this.queue.length;
    this.queue = this.queue.filter((t) => {
      if (t.runId === runId && t.status === "queued") { t.status = "cancelled"; return false; }
      return true;
    });
    return orig - this.queue.length;
  }

  get queuedCount(): number { return this.queue.filter((t) => t.status === "queued").length; }
  get length(): number { return this.queue.length; }
  get isEmpty(): boolean { return this.queue.length === 0; }
  clear(): void { this.queue = []; }

  private sortByPriority(): void {
    this.queue.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }
}
