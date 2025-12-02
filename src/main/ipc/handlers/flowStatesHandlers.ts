import { ipcMain } from "electron";
import { IPC_CHANNEL } from "../channels";
import { flowStateService } from "../../flows/state";
import { resumeFlowState } from "../../services/flowResumeService";
import { FlowStateIdSchema } from "@/shared/validation/ipc.zod";
import { handler, simpleHandler } from "./utils";

export function registerFlowStatesHandlers() {
  ipcMain.handle(
    IPC_CHANNEL.FLOW_STATES_LIST_PAUSED,
    simpleHandler(async () => {
      return flowStateService.getPausedFlows();
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.FLOW_STATES_GET,
    handler(FlowStateIdSchema, async ({ id }) => {
      const state = await flowStateService.getState(id);
      return state ?? null;
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.FLOW_STATES_DELETE,
    handler(FlowStateIdSchema, async ({ id }) => {
      await flowStateService.deleteState(id);
      return { deleted: true };
    })
  );

  ipcMain.handle(
    IPC_CHANNEL.FLOW_STATES_RESUME,
    handler(FlowStateIdSchema, async ({ id }) => {
      const result = await resumeFlowState(id);
      return {
        success: result.success,
        flowKey: result.flowKey,
        leadId: result.leadId,
        totalDuration: result.totalDuration,
        paused: result.paused,
        stateId: result.stateId,
        errorMessage: result.error?.message,
      };
    })
  );
}
