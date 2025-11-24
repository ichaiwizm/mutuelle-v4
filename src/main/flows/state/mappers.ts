import type { flowStates } from "../../db/schema";
import type { FlowState, FlowStateStatus } from "../engine/types";

type FlowStateRow = typeof flowStates.$inferSelect;

/**
 * Convert database row to FlowState domain object
 */
export function rowToState(row: FlowStateRow): FlowState {
  return {
    id: row.id,
    flowKey: row.flowKey,
    leadId: row.leadId ?? undefined,
    currentStepIndex: row.currentStepIndex,
    completedSteps: JSON.parse(row.completedSteps),
    stepStates: JSON.parse(row.stepStates ?? "{}"),
    status: row.status as FlowStateStatus,
    startedAt: row.startedAt.getTime(),
    pausedAt: row.pausedAt?.getTime(),
    resumedAt: row.resumedAt?.getTime(),
    completedAt: row.completedAt?.getTime(),
  };
}

/**
 * Convert FlowState domain object to database insert values
 */
export function stateToInsertValues(state: FlowState, now: number) {
  return {
    id: state.id,
    flowKey: state.flowKey,
    leadId: state.leadId,
    currentStepIndex: state.currentStepIndex,
    completedSteps: JSON.stringify(state.completedSteps),
    stepStates: JSON.stringify(state.stepStates),
    status: state.status,
    startedAt: new Date(state.startedAt),
    createdAt: new Date(now),
    updatedAt: new Date(now),
  };
}
