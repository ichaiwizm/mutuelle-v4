import type { FlowState, FlowExecutionConfig } from "../types";
import type { FlowStateService } from "../../state/FlowStateService";
import type { FlowLogger } from "../FlowLogger";

type PauseResumeConfig = {
  enabled: boolean;
  stateId?: string;
};

/**
 * Manages pause/resume functionality for flow execution
 */
export class PauseResumeManager {
  private currentState?: FlowState;
  private pauseRequested = false;

  constructor(
    private config: PauseResumeConfig,
    private stateService: FlowStateService
  ) {}

  get isEnabled(): boolean {
    return this.config.enabled;
  }

  get state(): Readonly<FlowState> | undefined {
    // Return a shallow copy to prevent external mutations
    return this.currentState ? { ...this.currentState } : undefined;
  }

  get isPauseRequested(): boolean {
    return this.pauseRequested;
  }

  requestPause(): void {
    if (!this.config.enabled) {
      console.warn("[PauseResumeManager] requestPause() called but not enabled");
      return;
    }
    this.pauseRequested = true;
  }

  async initialize(flowKey: string, leadId?: string, logger?: FlowLogger): Promise<number> {
    if (!this.config.enabled) return 0;

    if (this.config.stateId) {
      const loadedState = await this.stateService.getState(this.config.stateId);
      if (!loadedState) {
        throw new Error(`Flow state not found: ${this.config.stateId}`);
      }
      this.currentState = loadedState;
      if (this.currentState.flowKey !== flowKey) {
        throw new Error(`State flowKey mismatch: expected ${flowKey}, got ${this.currentState.flowKey}`);
      }
      await this.stateService.updateState(this.currentState.id, {
        status: "running",
        resumedAt: Date.now(),
      });
      logger?.info(`Resuming from step index ${this.currentState.currentStepIndex}`);
      return this.currentState.currentStepIndex;
    }

    this.currentState = await this.stateService.createState(flowKey, leadId);
    logger?.info(`Created flow state`, { stateId: this.currentState.id });
    return 0;
  }

  async checkpoint(stepIndex: number, stepId: string): Promise<void> {
    if (!this.config.enabled || !this.currentState) return;

    // Prepare updated state (don't mutate current state yet)
    const newCompletedSteps = [...this.currentState.completedSteps, stepId];
    const newStepIndex = stepIndex + 1;

    // Persist to DB first (atomic operation)
    await this.stateService.updateState(this.currentState.id, {
      currentStepIndex: newStepIndex,
      completedSteps: newCompletedSteps,
    });

    // Only update local state after successful DB write
    this.currentState = {
      ...this.currentState,
      completedSteps: newCompletedSteps,
      currentStepIndex: newStepIndex,
    };
  }

  async markPaused(): Promise<void> {
    if (this.currentState) {
      await this.stateService.markPaused(this.currentState.id);
    }
  }

  async markCompleted(): Promise<void> {
    if (this.currentState) {
      await this.stateService.markCompleted(this.currentState.id);
    }
  }

  async markFailed(): Promise<void> {
    if (this.currentState) {
      await this.stateService.markFailed(this.currentState.id);
    }
  }

  reset(): void {
    this.pauseRequested = false;
  }
}
