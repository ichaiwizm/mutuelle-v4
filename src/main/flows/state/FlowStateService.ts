import { randomUUID } from "node:crypto";
import type { FlowState } from "../engine/types";
import { flowStateRepository } from "./FlowStateRepository";

/**
 * Service for managing flow execution states
 */
export class FlowStateService {
  async createState(flowKey: string, leadId?: string): Promise<FlowState> {
    const state: FlowState = {
      id: randomUUID(),
      flowKey,
      leadId,
      currentStepIndex: 0,
      completedSteps: [],
      stepStates: {},
      status: "running",
      startedAt: Date.now(),
    };
    await flowStateRepository.insert(state);
    return state;
  }

  async getState(id: string): Promise<FlowState | null> {
    return flowStateRepository.findById(id);
  }

  async updateState(id: string, updates: Partial<FlowState>): Promise<void> {
    const data: Record<string, any> = {};

    if (updates.currentStepIndex !== undefined) data.currentStepIndex = updates.currentStepIndex;
    if (updates.completedSteps) data.completedSteps = JSON.stringify(updates.completedSteps);
    if (updates.stepStates) data.stepStates = JSON.stringify(updates.stepStates);
    if (updates.status) data.status = updates.status;
    if (updates.pausedAt) data.pausedAt = new Date(updates.pausedAt);
    if (updates.resumedAt) data.resumedAt = new Date(updates.resumedAt);
    if (updates.completedAt) data.completedAt = new Date(updates.completedAt);

    await flowStateRepository.update(id, data);
  }

  async markPaused(id: string): Promise<void> {
    await this.updateState(id, { status: "paused", pausedAt: Date.now() });
  }

  async markCompleted(id: string): Promise<void> {
    await this.updateState(id, { status: "completed", completedAt: Date.now() });
  }

  async markFailed(id: string): Promise<void> {
    await this.updateState(id, { status: "failed", completedAt: Date.now() });
  }

  async getPausedFlows(): Promise<FlowState[]> {
    return flowStateRepository.findByStatus("paused");
  }

  async getFlowsByKey(flowKey: string): Promise<FlowState[]> {
    return flowStateRepository.findByFlowKey(flowKey);
  }

  async getFlowsByLeadId(leadId: string): Promise<FlowState[]> {
    return flowStateRepository.findByLeadId(leadId);
  }

  async deleteState(id: string): Promise<void> {
    return flowStateRepository.delete(id);
  }
}

export const flowStateService = new FlowStateService();
