import type { GlobalTask } from "./types/global";

/**
 * Priority-based FIFO queue for global tasks.
 * Tasks are sorted by priority (higher first), then by queue time (FIFO).
 */
export class TaskQueue {
  private queue: GlobalTask[] = [];

  /**
   * Add tasks to the queue and sort by priority.
   */
  add(tasks: GlobalTask[]): void {
    this.queue.push(...tasks);
    this.sortByPriority();
  }

  /**
   * Remove a task from the queue by ID.
   */
  remove(taskId: string): boolean {
    const index = this.queue.findIndex((t) => t.id === taskId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get and mark the next queued task as running.
   */
  getNext(): GlobalTask | undefined {
    const index = this.queue.findIndex((t) => t.status === "queued");
    if (index === -1) return undefined;

    const task = this.queue[index];
    task.status = "running";
    return task;
  }

  /**
   * Check if there are any queued tasks.
   */
  hasQueuedTasks(): boolean {
    return this.queue.some((t) => t.status === "queued");
  }

  /**
   * Get all tasks for a specific run.
   */
  getTasksForRun(runId: string): GlobalTask[] {
    return this.queue.filter((t) => t.runId === runId);
  }

  /**
   * Remove all queued tasks for a specific run.
   * Returns the number of tasks removed.
   */
  removeQueuedTasksForRun(runId: string): number {
    const originalLength = this.queue.length;
    this.queue = this.queue.filter((task) => {
      if (task.runId === runId && task.status === "queued") {
        task.status = "cancelled";
        return false;
      }
      return true;
    });
    return originalLength - this.queue.length;
  }

  /**
   * Get count of queued tasks.
   */
  get queuedCount(): number {
    return this.queue.filter((t) => t.status === "queued").length;
  }

  /**
   * Get total queue length.
   */
  get length(): number {
    return this.queue.length;
  }

  /**
   * Check if queue is empty.
   */
  get isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * Clear the queue.
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * Sort queue by priority (higher first), maintaining FIFO for same priority.
   */
  private sortByPriority(): void {
    this.queue.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }
}
