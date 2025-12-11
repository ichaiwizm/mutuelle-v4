import { randomUUID } from "node:crypto";
import type { FlowState } from "../engine/types";
import { flowStateRepository } from "./FlowStateRepository";
import { logger } from "@/main/services/logger";

/**
 * Service for managing flow execution states
 */
export class FlowStateService {
  async createState(flowKey: string, leadId?: string): Promise<FlowState> {
    const ctx = { service: "FLOW_STATE", flowKey, leadId: leadId ? Number(leadId) : undefined };
    logger.debug("Creating flow state", ctx);
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

    await flowStateRepository.insert(state);
    logger.debug(`Flow state created in ${Date.now() - startTime}ms`, { ...ctx, stateId: state.id });
    return state;
  }

  async getState(id: string): Promise<FlowState | null> {
    logger.debug("Getting flow state", { service: "FLOW_STATE", stateId: id.substring(0, 8) });
    const result = await flowStateRepository.findById(id);
    return result;
  }

  async updateState(id: string, updates: Partial<FlowState>): Promise<void> {
    logger.debug("Updating flow state", { service: "FLOW_STATE", stateId: id.substring(0, 8), keys: Object.keys(updates) });

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
