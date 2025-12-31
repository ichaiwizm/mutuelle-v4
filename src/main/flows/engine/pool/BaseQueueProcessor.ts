/**
 * Base abstract class for queue processors.
 * Provides common concurrency control and processing state management.
 */
export abstract class BaseQueueProcessor {
  protected maxConcurrent: number;
  protected isPaused = false;
  protected isProcessing = false;

  constructor(maxConcurrent: number) {
    this.maxConcurrent = maxConcurrent;
  }

  /**
   * Get the number of currently running tasks.
   */
  protected abstract getRunningCount(): number;

  /**
   * Check if there are tasks waiting in the queue.
   */
  protected abstract hasQueuedTasks(): boolean;

  /**
   * Check if there's work to do (queued or running).
   */
  protected hasWork(): boolean {
    return this.hasQueuedTasks() || this.getRunningCount() > 0;
  }

  /**
   * Check if we can start more tasks.
   */
  protected canStartMore(): boolean {
    return this.getRunningCount() < this.maxConcurrent && this.hasQueuedTasks();
  }

  /**
   * Pause processing (stop starting new tasks).
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * Resume processing.
   */
  resume(): void {
    this.isPaused = false;
  }

  /**
   * Check if processing is paused.
   */
  get paused(): boolean {
    return this.isPaused;
  }

  /**
   * Check if currently processing.
   */
  get processing(): boolean {
    return this.isProcessing;
  }

  /**
   * Wait for a worker slot to become available.
   * Default implementation with polling - can be overridden.
   */
  protected waitForWorkerSlot(): Promise<void> {
    return new Promise((resolve) => {
      const check = (): void => {
        if (this.canStartMore()) {
          resolve();
          return;
        }

        if (!this.hasQueuedTasks()) {
          setTimeout(resolve, 100);
          return;
        }

        setTimeout(check, 50);
      };
      check();
    });
  }
}
