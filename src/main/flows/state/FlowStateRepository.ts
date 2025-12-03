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
    console.log(`[FLOW_STATE_REPO] insert() | stateId: ${state.id.substring(0, 8)}...`);
    const startTime = Date.now();
    const values = stateToInsertValues(state, Date.now());
    await db.insert(flowStates).values(values);
    console.log(`[FLOW_STATE_REPO] insert() done in ${Date.now() - startTime}ms`);
  }

  async findById(id: string): Promise<FlowState | null> {
    console.log(`[FLOW_STATE_REPO] findById() | id: ${id.substring(0, 8)}...`);
    const startTime = Date.now();
    const rows = await db.select().from(flowStates).where(eq(flowStates.id, id));
    console.log(`[FLOW_STATE_REPO] findById() done in ${Date.now() - startTime}ms | found: ${rows.length > 0}`);
    return rows[0] ? rowToState(rows[0]) : null;
  }

  async findByStatus(status: string): Promise<FlowState[]> {
    console.log(`[FLOW_STATE_REPO] findByStatus() | status: ${status}`);
    const startTime = Date.now();
    const rows = await db.select().from(flowStates).where(eq(flowStates.status, status));
    console.log(`[FLOW_STATE_REPO] findByStatus() done in ${Date.now() - startTime}ms | count: ${rows.length}`);
    return rows.map(rowToState);
  }

  async findByFlowKey(flowKey: string): Promise<FlowState[]> {
    console.log(`[FLOW_STATE_REPO] findByFlowKey() | flowKey: ${flowKey}`);
    const startTime = Date.now();
    const rows = await db.select().from(flowStates).where(eq(flowStates.flowKey, flowKey));
    console.log(`[FLOW_STATE_REPO] findByFlowKey() done in ${Date.now() - startTime}ms | count: ${rows.length}`);
    return rows.map(rowToState);
  }

  async findByLeadId(leadId: string): Promise<FlowState[]> {
    console.log(`[FLOW_STATE_REPO] findByLeadId() | leadId: ${leadId.substring(0, 8)}...`);
    const startTime = Date.now();
    const rows = await db.select().from(flowStates).where(eq(flowStates.leadId, leadId));
    console.log(`[FLOW_STATE_REPO] findByLeadId() done in ${Date.now() - startTime}ms | count: ${rows.length}`);
    return rows.map(rowToState);
  }

  async update(id: string, data: Record<string, any>): Promise<void> {
    console.log(`[FLOW_STATE_REPO] update() | id: ${id.substring(0, 8)}... | keys: ${Object.keys(data).join(', ')}`);
    const startTime = Date.now();
    await db.update(flowStates).set({ ...data, updatedAt: new Date() }).where(eq(flowStates.id, id));
    console.log(`[FLOW_STATE_REPO] update() done in ${Date.now() - startTime}ms`);
  }

  async delete(id: string): Promise<void> {
    console.log(`[FLOW_STATE_REPO] delete() | id: ${id.substring(0, 8)}...`);
    const startTime = Date.now();
    await db.delete(flowStates).where(eq(flowStates.id, id));
    console.log(`[FLOW_STATE_REPO] delete() done in ${Date.now() - startTime}ms`);
  }
}

export const flowStateRepository = new FlowStateRepository();
