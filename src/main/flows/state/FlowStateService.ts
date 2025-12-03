import { randomUUID } from "node:crypto";
import type { FlowState } from "../engine/types";
import { flowStateRepository } from "./FlowStateRepository";

/**
 * Service for managing flow execution states
 */
export class FlowStateService {
  async createState(flowKey: string, leadId?: string): Promise<FlowState> {
    console.log(`[FLOW_STATE_SERVICE] createState() | flowKey: ${flowKey} | leadId: ${leadId?.substring(0, 8)}...`);
    const startTime = Date.now();

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

    console.log(`[FLOW_STATE_SERVICE] Inserting state to repository...`);
    const insertStart = Date.now();
    await flowStateRepository.insert(state);
    console.log(`[FLOW_STATE_SERVICE] State inserted in ${Date.now() - insertStart}ms`);
    console.log(`[FLOW_STATE_SERVICE] createState() done in ${Date.now() - startTime}ms | stateId: ${state.id}`);
    return state;
  }

  async getState(id: string): Promise<FlowState | null> {
    console.log(`[FLOW_STATE_SERVICE] getState() | id: ${id.substring(0, 8)}...`);
    const startTime = Date.now();
    const result = await flowStateRepository.findById(id);
    console.log(`[FLOW_STATE_SERVICE] getState() done in ${Date.now() - startTime}ms | found: ${!!result}`);
    return result;
  }

  async updateState(id: string, updates: Partial<FlowState>): Promise<void> {
    console.log(`[FLOW_STATE_SERVICE] updateState() | id: ${id.substring(0, 8)}... | keys: ${Object.keys(updates).join(', ')}`);
    const startTime = Date.now();

    const data: Record<string, any> = {};

    if (updates.currentStepIndex !== undefined) data.currentStepIndex = updates.currentStepIndex;
    if (updates.completedSteps) data.completedSteps = JSON.stringify(updates.completedSteps);
    if (updates.stepStates) data.stepStates = JSON.stringify(updates.stepStates);
    if (updates.status) data.status = updates.status;
    if (updates.pausedAt) data.pausedAt = new Date(updates.pausedAt);
    if (updates.resumedAt) data.resumedAt = new Date(updates.resumedAt);
    if (updates.completedAt) data.completedAt = new Date(updates.completedAt);

    await flowStateRepository.update(id, data);
    console.log(`[FLOW_STATE_SERVICE] updateState() done in ${Date.now() - startTime}ms`);
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
