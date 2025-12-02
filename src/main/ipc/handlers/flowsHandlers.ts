import { ipcMain } from "electron";
import { IPC_CHANNEL } from "../channels";
import { FlowsService } from "../../services/flowsService";
import { simpleHandler } from "./utils";

export function registerFlowsHandlers() {
  ipcMain.handle(
    IPC_CHANNEL.FLOWS_LIST,
    simpleHandler(() => FlowsService.list())
  );
}
