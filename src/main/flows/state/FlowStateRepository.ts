import { eq } from "drizzle-orm";
import { db } from "../../db";
import { flowStates } from "../../db/schema";
import type { FlowState } from "../engine/types";
import { rowToState, stateToInsertValues } from "./mappers";

/**
 * Repository for flow state database operations
 */
export class FlowStateRepository {
  async insert(state: FlowState): Promise<void> {
    const values = stateToInsertValues(state, Date.now());
    await db.insert(flowStates).values(values);
  }

  async findById(id: string): Promise<FlowState | null> {
    const rows = await db.select().from(flowStates).where(eq(flowStates.id, id));
    return rows[0] ? rowToState(rows[0]) : null;
  }

  async findByStatus(status: string): Promise<FlowState[]> {
    const rows = await db.select().from(flowStates).where(eq(flowStates.status, status));
    return rows.map(rowToState);
  }

  async findByFlowKey(flowKey: string): Promise<FlowState[]> {
    const rows = await db.select().from(flowStates).where(eq(flowStates.flowKey, flowKey));
    return rows.map(rowToState);
  }

  async findByLeadId(leadId: string): Promise<FlowState[]> {
    const rows = await db.select().from(flowStates).where(eq(flowStates.leadId, leadId));
    return rows.map(rowToState);
  }

  async update(id: string, data: Record<string, any>): Promise<void> {
    await db.update(flowStates).set({ ...data, updatedAt: new Date() }).where(eq(flowStates.id, id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(flowStates).where(eq(flowStates.id, id));
  }
}

export const flowStateRepository = new FlowStateRepository();
