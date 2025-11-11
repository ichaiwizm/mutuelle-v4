import { ipcMain } from "electron";
import { IPC_CHANNEL } from "./channels";
import { LeadsService } from "../services/leadsService";
import { CredentialsService } from "../services/credentialsService";
import { AutomationService } from "../services/automationService";

export function registerIpc() {
  ipcMain.handle(IPC_CHANNEL.LEADS_LIST, () => LeadsService.list());
  ipcMain.handle(IPC_CHANNEL.LEADS_CREATE, (_e, lead) => LeadsService.create(lead));
  ipcMain.handle(IPC_CHANNEL.LEADS_REMOVE, (_e, id) => LeadsService.remove(id));
  ipcMain.handle(IPC_CHANNEL.CREDS_UPSERT, (_e, p) => CredentialsService.upsert(p));
  ipcMain.handle(IPC_CHANNEL.CREDS_TEST, (_e, platform) => CredentialsService.test(platform));
  ipcMain.handle(IPC_CHANNEL.AUTO_ENQUEUE, (_e, items) => AutomationService.enqueue(items));
}
